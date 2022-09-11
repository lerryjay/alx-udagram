import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {
  const credentials = {
    user: "udagram_user",
    password: "P@sSw07d!@#"
  }
  // Init the Express application
  const app = express();
  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());


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

  app.get("/healthcheck", async (req, res) => {
    const healthcheck: { running: number, message: any, timestamp: number } = {
      message: 'OK',
      running: process.uptime(),
      timestamp: Date.now()
    };
    try {
      res.send(healthcheck);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  })
  const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const base64Data = (req.headers.authorization || '').split(' ')[1] || ''
    const [user, password] = Buffer.from(base64Data, 'base64').toString().split(':')

    // Verify login credentials
    if (user && password && user === credentials.user && password === credentials.password) {
      return next()
    }
    res.set('WWW-Authenticate', 'Basic realm="401"')
    res.status(401).send('Unathorized.')
  }

  app.use(authMiddleware);


  app.get("/filteredimage", async (req:Request, res:Response) => {
    const image_url:string = req.query.image_url;
    try {
      if (!image_url) return res.send('Please provide image url').status(400); // throw 400 if image url is not passed
      const filteredpath = await filterImageFromURL(image_url);
      if (!filteredpath) return res.send('File not found').status(404); // Return 404 if file is not found

      res.sendFile(filteredpath, (err:any) => {
        if (err) throw err; // Failed due to some things
        else deleteLocalFiles([filteredpath]); // Delete after response sent
      });
    } catch ( error) {
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