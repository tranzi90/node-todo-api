const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {ObjectID} = require('mongodb');

const todos = [{
    _id: new ObjectID(),
    text: 'test 1'
}, {
    _id: new ObjectID(),
    text: 'test 2',
    completed: true,
    completedAt: 333
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

describe('GET /todos/:id', function () {

    it('should get todo with id', function (done) {

        request(app)
            .get(`/todos/${todos[0]._id.toString()}`)
            .expect(200)
            .expect(function (res) {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if no such todo', function (done) {
        request(app)
            .get(`/todos/${new ObjectID().toString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', function (done) {
        request(app)
            .get(`/todos/123`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', function () {

    it('should remove a todo', function (done) {
        let id = todos[1]._id.toString();

        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect(function (res) {
                expect(res.body.todo._id).toBe(id);
            })
            .end(function (err, res) {
                if (err)
                    return done(err);

                Todo.findById(id).then(function (todo) {
                    expect(todo).toBeNull();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return 404 if no such todo', function (done) {
        request(app)
            .delete(`/todos/${new ObjectID().toString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', function (done) {
        request(app)
            .delete(`/todos/123`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', function () {
    it('should update todo', function (done) {
        let id = todos[0]._id.toString();
        let newTodo = {
            text: 'test',
            completed: true
        };

        request(app)
            .patch(`/todos/${id}`)
            .send(newTodo)
            .expect(200)
            .expect(function (res) {
                expect(res.body.todo.text).toBe(newTodo.text);
                expect(res.body.todo.completed).toBe(true);
                expect(typeof res.body.todo.completedAt).toBe('number');
            })
            .end(done);
    });

    it('should clear compAt on false comp', function (done) {
        let id = todos[1]._id.toString();
        let newTodo = {
            text: 'test',
            completed: false
        };

        request(app)
            .patch(`/todos/${id}`)
            .send(newTodo)
            .expect(200)
            .expect(function (res) {
                expect(res.body.todo.text).toBe(newTodo.text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBeNull();
            })
            .end(done);
    });
});