const express = require("express");
const { HttpError, saveArchive, createRenderVersion } = require("../lib/archive-service");
const { ValidationError, validatePayload } = require("../lib/validation");
const { parseStrictDate } = require("../lib/date-utils");

const ERROR_MESSAGES = {
  validation_error: "Проверьте заполнение формы. Некоторые поля содержат некорректные значения.",
  kv_num_exists: "Карта с таким kv_num уже существует. Загрузите существующую карту или измените номер.",
  internal_error: "Не удалось сохранить форму из-за внутренней ошибки сервера. Попробуйте еще раз позже.",
  archive_not_found: "Архивная запись не найдена.",
  invalid_archive_id: "Некорректный идентификатор архивной записи.",
  kv_num_required_for_render: "Для формирования документа нужно заполнить номер карты вызова (kv_num).",
};

function errorResponse(error, details) {
  const body = {
    error,
    message: ERROR_MESSAGES[error] || "Не удалось обработать запрос.",
  };

  if (details) body.details = details;
  return body;
}

function requireRenderablePrDate(payload) {
  if (
    parseStrictDate(payload?.pr_date_iso_raw)
    || parseStrictDate(payload?.pr_date)
  ) {
    return;
  }

  throw new ValidationError([{
    path: "pr_date",
    message: "Дата приёма вызова обязательна для формирования PDF",
  }]);
}

function createGenerateRouter(pool) {
  const router = express.Router();

  router.post("/generate", async (req, res) => {
    try {
      validatePayload(req.body);
      requireRenderablePrDate(req.body);
      const saved = await saveArchive(pool, req.body);

      try {
        const render = await createRenderVersion(pool, saved.archiveId);
        return res.json({
          ok: true,
          archive_id: saved.archiveId,
          render_id: render.renderId,
          version: render.version,
          already_pending: Boolean(render.alreadyPending),
          message: render.alreadyPending ? "Формирование уже выполняется" : "queued",
        });
      } catch (e) {
        if (e instanceof HttpError && e.status === 400 && e.message === "kv_num_required_for_render") {
          return res.json({
            archive_id: saved.archiveId,
            render_id: null,
            version: null,
            message: "saved_no_kv_num",
          });
        }
        throw e;
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(err.status).json(errorResponse(err.code, err.details));
      }
      if (err instanceof HttpError) {
        return res.status(err.status).json(errorResponse(err.message));
      }

      console.error("Generate error:", err);
      return res.status(500).json(errorResponse("internal_error"));
    }
  });

  return router;
}

createGenerateRouter.requireRenderablePrDate = requireRenderablePrDate;

module.exports = createGenerateRouter;
