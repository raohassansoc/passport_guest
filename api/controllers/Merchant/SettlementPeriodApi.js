const SettlementPeriodModel = require("../../models/Merchant/SettlementPeriod");
const { SettlementPeriodSchemas } = require("../../schemas/MerchantSchemas");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const Sentry = require("@sentry/node");

const SettlementPeriodApi = () => {
  // For create and update  SettlementPeriod
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, SettlementPeriodSchemas)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            await crudServices.update(
              SettlementPeriodModel,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(
              SettlementPeriodModel,
              reqData
            );
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Settlement Period ${
              reqData._id ? "updated" : "created"
            } successfully`,
            data: response || {},
          });
        } catch (error) {
          console.log(error);
          Sentry.captureException(error);
          return res.status(501).json(error);
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
  // for deleting  SettlementPeriod
  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(SettlementPeriodModel, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Settlement Period deleted successfully.`,
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
      Sentry.captureException(error);
      return res.status(501).json(error);
    }
  };

  const get = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query.keyword) {
        whereClause.name = { $regex: req.query.keyword, $options: "i" };
      }
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }
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
      let response = await crudServices.get(SettlementPeriodModel, {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          updated_at: 0,
          __v: 0,
        },
        skip: skip,
        limit: limit,
        sortField: "name",
      });
      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: `Settlement Period get successfully.`,
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      return res.status(501).json(error);
    }
  };

  return {
    save,
    destroy,
    get,
  };
};
module.exports = SettlementPeriodApi;
