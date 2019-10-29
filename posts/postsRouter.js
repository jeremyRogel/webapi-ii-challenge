const express = require('express');
const db = require('../data/db.js');

const router = express.Router();

router.get('/', (req, res) => {
  db.find()
    .then(posts => res.status(200).json(posts))
    .catch(err => {
      console.log(err);
      res.status(500)
        .json({ error: "The posts information could not be retrieved." });
    });
});

router.post('/', (req, res) => {
  const { title, contents } = req.body;
  if (!title || !contents) {
    return res.status(400).json({error: "Please provide title and contents for the post."});
  }

  db.insert({title, contents})
    .then(({id}) => {
      getPost(id, res);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: "There was an error while saving the post to the database"});
    });
});

function getPost(id, res) {
  return db.findById(id)
    .then(([post]) => {
      console.log(post);
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({error: "The post with the specified ID does not exist."});
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: "The post information could not be retrieved.", id: id});
    });
}

router.get('/:id', (req, res) => {
  const { id } = req.params;
  getPost(id, res);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, contents } = req.body;

  if (!title && !contents) {
    return res.status(400).json({error: "Please provide title and contents for the post."});
  }

  db.update(id, {title, contents})
    .then(updated => {
      if (updated) {
        getPost(id, res);
      } else {
        res.status(404).json({error: "The post with the specified ID does not exist."});
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: "The post information could not be modified."});
    });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.remove(id)
    .then(removed => {
      if (removed) {
        res.status(204).end();
      } else {
        res.status(404).json({error: "The post with the specified ID does not exist."});
      }
    })
    .catch(err => {
      console.log("delete", err);
      res.status(500).json({error: "The post could not be removed"});
    });
});

router.get('/:post_id/comments', (req, res) => {
  const { post_id } = req.params;
  db.findById(post_id)
    .then(([post]) => {
      if (post) {
        db.findPostComments(post_id)
          .then(comments => {
            res.status(200).json(comments);
          });
      } else {
        res.status(404).json({error: "The post with the specified ID does not exist."});
      }
    })
    .catch(err => {
      console.log("get comments", err);
      res.status(500).json({error: "The comments information could not be retrieved."});
    });
});

router.post('/:post_id/comments', (req, res) => {
  const { post_id } = req.params;
  const { text } = req.body;

  if (text === "" || typeof text !== "string") {
    return res.status(400).json({error: "Please provide text for the comment."});
  }

  db.insertComment({ text, post_id })
    .then(({id: comment_id}) => {
      db.findCommentById(comment_id)
        .then(([comment]) => {
          if (comment) {
            res.status(200).json(comment);
          } else {
            res.status(404).json({error: "Comment with the specified ID does not exist."});
          }
        })
        .catch(err => {
          console.log("post comment get", err);
          res.status(500).json({error: "The comments information could not be retrieved."});
        });
    })
    .catch(err => {
      console.log("post comment", err);
      res.status(500).json({error: "There was an error while saving the comment to the database"});
    });
});

module.exports = router;