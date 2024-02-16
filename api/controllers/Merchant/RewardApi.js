const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const { RewardSchemas } = require("../../schemas/MerchantSchemas");
const Reward = require("../../models/Merchant/Reward");
const Sentry = require("@sentry/node");

const RewardApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, RewardSchemas)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            await crudServices.update(Reward, { _id: reqData._id }, reqData);
          } else {
            response = await crudServices.insert(Reward, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Reward Data ${
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
        Sentry.captureException(error);
        return res.status(500).json({
          code: 500,
          success: false,
          message: "Internal Server Error",
          error: err,
        });
      });
  };

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(Reward, { _id: req.body.record_id });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Reward Data deleted successfully.`,
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
      if (req.query.merchant_id)
        whereClause.merchant_id = ObjectId(req.query.merchant_id);

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

      let executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        skip: skip,
        limit: limit,
        sortField: "_id",
      };

      let response = await crudServices.get(Reward, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.length;
      return res.status(200).json({
        code: 200,
        success: true,
        message: `Reward Data get successfully.`,
        data: response,
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

module.exports = RewardApi;
