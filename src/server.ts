import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });

  app.get("/filteredimage", async (req, res) => {
    const image_url = req.query.image_url;
    try {
      if (!image_url) return res.send('Please provide image url').status(400); // throw 400 if image url is not passed
      const filteredpath = await filterImageFromURL(image_url);
      if (!filteredpath) return res.send('File not found').status(404); // Return 404 if file is not found

      res.sendFile(filteredpath, (err) => {
        if (err) throw err; // Failed due to some things
        else deleteLocalFiles([filteredpath]); // Delete after response sent
      });
    } catch (error) {
      console.log(error)
      res.status(500).send('Internal server error'); // Internal server error upon unexpected failures
    }

  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();