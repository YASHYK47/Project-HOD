const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { ObjectID } = require("mongodb");
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");

var { mongoose } = require("./../db/mongoose.js");
var { User } = require("../models/user.js");
var { Admin } = require("../models/admin.js");
var { authenticateuser } = require("../middleware/authenticateuser.js");
var { authenticateadmin } = require("../middleware/authenticateadmin.js");
var { Quiz } = require("./../models/quiz.js");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

router.get("/",(req,res)=>{
  res.status(200).send("App working fine");
})

router.post("/add/quiz", authenticateadmin, (req, res) => {
  const quiz = new Quiz({
    questions: req.body.questions,
    sem: req.body.tags,
    subject: req.body.section,
    addedBy: req.user._id,
    endTime: req.body.endTime,
    quizName: req.body.quizName
  });
  quiz
    .save()
    .then(quiz => {
      res.status(200).send(quiz);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.get("/quiz/:quizId", authenticateadmin, (req, res) => {
  const quizId = req.params.quizId;
  Quiz.findOne({ _id: quizId })
    .then(quiz => {
      res.status(200).send(quiz);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.get("/quiz/:quizId", authenticateuser, (req, res) => {
  const quizId = req.params.quizId;
  Quiz.findOne({ _id: quizId })
    .then(quiz => {
      if (quiz.status) {
        res.status(200).send(quiz);
      } else {
        res.status(200).json({ msg: "Quiz not active now." });
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.get("/quiz/all",authenticateadmin, (req, res) => {
  // var currdate = newIndDate();
  Quiz.find()
    .sort({ endTime: -1 })
    .then(quizes => {
      res.status(200).send(quizes);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.post("/submit/quiz/:quizId", authenticateuser, (req, res) => {
  var score = 0;
  const answers = req.body.answers;
  Quiz.findOne({ _id: quizId })
    .then(quiz => {
      asyncForEach(quiz.questions, async (question, index) => {
        if (question.answer === answers[index].answer) {
          score += question.marks;
        } else {
          score += question.negativeMarks;
        }
      });
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.post("/register/user", (req, res) => {
  var body = _.pick(req.body, ["name", "email", "age", "parentName","password"]);
  var user = new User(body);

  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header("x-auth", token).send(user);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.post("/register/admin", (req, res) => {
  var body = _.pick(req.body, ["name", "email", "specialist","password"]);
  var user = new Admin(body);
  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header("x-auth", token).send(user);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.get("/user/profile", authenticateuser, (req, res) => {
  var token = req.header("x-auth");
  Userstud.findByToken(token).then(user => {
    res.send(req.user);
  });
});

router.get("/admin/profile", authenticateadmin, (req, res) => {
  var token = req.header("x-auth");
  Admin.findByToken(token).then(user => {
    res.send(req.user);
  });
});

router.delete("/userstud/logout", authenticateuser, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400).send();
    }
  );
});

router.delete("/userstaf/logout", authenticateadmin, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400).send();
    }
  );
});

router.post("/userstud/login", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);
  Userstud.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.post("/userstaf/login", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);
  Userstaf.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

module.exports = router;
