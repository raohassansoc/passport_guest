let mongoose = require("mongoose");
const RealEstateCategory = require("./RealEstateCategory");
let Schema = mongoose.Schema;
const Country = require("../Master/Country");
const City = require("../Master/City");
const Province = require("../Master/Province");

let RealEstateSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Real Estate Name."],
    minLength: [2, "Real Estate name Must be atleast 2 characters long."],
    maxLength: [50, "Real Estate name must be atmost 50 chracters long."],
  },
  local_name: {
    type: String,
  },
  street_name: {
    type: String,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: RealEstateCategory,
    required: [true, "Real Estate Category required for Real Estate details."],
  },
  address_line_1: {
    type: String,
  },
  address_line_2: {
    type: String,
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: City,
    required: [true, "City Data required for Real Estate details."],
  },
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Province,
    required: [true, "Province Data required for Real Estate details."],
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    required: [true, "Country Data required for Real Estate details."],
  },
  zipcode: {
    type: String,
    required: [true, "ZipCode/PostalCode required for Real Estate details."],
  },
  contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    required: [true, "Contact Code required for Real Estate details."],
  },
  contact_number: {
    type: Number,
    required: [true, "Contact Number required for Real Estate details."],
  },
  email_id: {
    type: String,
  },
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  description: {
    type: String,
  },
  thumbnail_image: {
    type: String,
  },
  images: {
    type: [String],
  },
  location_googlemaps_link: {
    type: String,
  },
  is_deleted: {
    type: Boolean,
  },
  deleted_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
    default: Date,
  },
  created_at: {
    type: Date,
    default: Date,
  },
});

RealEstateSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let RealEstate = mongoose.model("real_estate", RealEstateSchema);
module.exports = RealEstate;
