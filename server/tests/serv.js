const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    text: 'test 1'
}, {
    text: 'test 2'
}];

beforeEach(function (done) {
    Todo.deleteMany({})
        .then(() => Todo.insertMany(todos))
        .then(() => done());
});

describe('POST /todos', function () {
    it('should create a new todo', function (done) {
        var text = 'testik';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => expect(res.body.text).toBe(text))
            .end(function (err, res) {
                if (err)
                    return done(err);

                Todo.find({text}).then(function (todos) {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not create wrong todo ', function (done) {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end(function (err, res) {
                if (err)
                    return done(err);

                Todo.find().then(function (todos) {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /todos', function () {
    it('should get all todos', function (done) {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => expect(res.body.todos.length).toBe(2))
            .end(done);
    });
});