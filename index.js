const express = require=('express');
const postsRouter = router('./posts/postsRouter.js');

const server = express();
server.use(express.json());

server.use('/api/posts', postsRouter);

server.listen(5000, () => console.log("server on port 5000"));