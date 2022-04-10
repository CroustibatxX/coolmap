const express = require("express");
const placeModel = require("./Model.js/PlaceModel");
const commentModel = require("./Model.js/CommentModel");
const multer = require("multer");
const app = express();
const fs = require('fs')
const path = require('path');

/* PLACE */
app.post("/addplace", async (request, response) => {
    let place = new placeModel(request.body);
    try {
      await place.save();
      response.send(place);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.get("/getplaces", async (request, response) => {
    let places = await placeModel.find({});
    try {
      response.send(places);
    } catch (error) {
      response.status(500).send(error);
    }
  });

  app.post("/removePlace", async (request, response) => {
    await placeModel.remove({_id: request.body.id});
    try {
      response.send("ok");
    } catch (error) {
      response.status(500).send(error);
    }
  });

  app.post("/editPlace", async (request, response) => {
    try {
      let oldPlace = await placeModel.findOne({_id: request.body._id});
      await placeModel.updateOne({_id: request.body._id},{$set : request.body});
      let place = await placeModel.findOne({_id: request.body._id});

      let difference = oldPlace.images.filter(x => !request.body.images.includes(x));

      difference.forEach(element => {
        fs.unlink(path.join(__dirname, 'build/images/uploads/', element), (err) => {
          if (err) {
            console.error(err)
          }
        })
      });
      
      response.send(place);
    } catch (error) { 
      console.log(error)
      response.status(500).send(error);
    }
  });

  /*Image upload*/
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './build/images/uploads/')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + file.originalname)
    },
  })


  const upload = multer({ storage: storage })

  app.post('/upload', upload.single('file'), async (request, res) => {
    let filter = {_id: request.body.placeid};
    let update = {
      $push: {
        images: request.file.filename
      },
    };
    await placeModel.updateOne(filter,update);

    res.json({})
  })


  app.post("/getPlaceImages", async (request, response) => {
    let images = await placeModel.findOne({_id: request.body.id});
    try {
      response.send(images);
    } catch (error) {
      response.status(500).send(error);
    }
  });




/* COMMENT */
  app.post("/addcomment", async (request, response) => {
    let comment = new commentModel(request.body);
    try {
      await comment.save();
      response.send(comment);
    } catch (error) {
      response.status(500).send(error);
    }
  });

  app.post("/getcomments", async (request, response) => {
    let comments = await commentModel.find({placeid: request.body.id});
    try {
      response.send(comments);
    } catch (error) {
      response.status(500).send(error);
    }
  });

  app.post("/removeComment", async (request, response) => {
    await commentModel.deleteOne({_id: request.body.id});
    try {
      response.send("ok");
    } catch (error) {
      response.status(500).send(error);
    }
  });




module.exports = app;