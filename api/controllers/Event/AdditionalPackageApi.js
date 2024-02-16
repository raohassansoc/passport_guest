const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const AdditionalPackage = require("../../models/Event/AdditionalPackage");
const { AdditionalPackageSchema } = require("../../schemas/EventSchema");
const Sentry = require("@sentry/node");

const AdditionalPackageApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, AdditionalPackageSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            response = await crudServices.update(
              AdditionalPackage,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(AdditionalPackage, reqData);
          }
          return res.status(201).json({
            code: 201,
            success: true,
            message: `Event Additional Package Details ${
              reqData._id ? `updated` : `created`
            } successfully.`,
            data: response,
          });
        } catch (error) {
          Sentry.captureException(error);
          return res.status(501).json({
            code: 501,
            success: false,
            message: "Internal Server Error",
            error: error,
          });
        }
      })
      .catch((err) => {
        Sentry.captureException(err);
        return res.status(500).json({
          code: 500,
          success: false,
          message: "Internal Server Error",
          error: err,
        });
      });
  };

  const get = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;

      if (req.query._id) whereClause._id = ObjectId(req.query._id);
      if (req.query.event_id)
        whereClause.event_id = ObjectId(req.query.event_id);
      if (req.query.keyword)
        whereClause.name = { $regex: req.query.keyword, $options: "i" };

      const {
        query: { current_page, page_size },
      } = req;
      let skip;
      let limit;
      if (current_page && page_size) {
        skip =
          parseInt(current_page) > 0
            ? (parseInt(current_page) - 1) * parseInt(page_size)
            : 0;
        limit = parseInt(page_size);
      }

      const executing_parameters = {
        where: whereClause,
        skip: skip,
        limit: limit,
        projection: {
          __v: 0,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
      };

      let response = await crudServices.get(
        AdditionalPackage,
        executing_parameters
      );

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Event Additional Package Details get successfully.",
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(AdditionalPackage, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Event Additional Package Details deleted successfully.`,
          data: {},
        });
      } else {
        return res.status(207).json({
          code: 207,
          success: false,
          message: `Invalid Url Parameters`,
          data: {},
        });
      }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  return {
    save,
    get,
    destroy,
  };
};

module.exports = AdditionalPackageApi;
