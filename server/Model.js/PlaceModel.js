const mongoose = require("mongoose");

const PlaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
  },
  placeName: {
    type: String,
  },
  lng: {
    type: Number,
    required: true,
  },
  images: {
    type: [String],
  },
  beerPrice: {
    type: Number,
  },
  happyPrice: {
    type: Number,
  },
  ricardPrice: {
    type: Number,
  },
  menu: {
    type: String,
  },
  lat: {
    type: Number,
    required: true,
  },
});

const Place = mongoose.model("Place", PlaceSchema);

module.exports = Place;