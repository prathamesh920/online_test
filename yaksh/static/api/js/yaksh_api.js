var URL_ROOT = "yaksh.fossee.in";
var CLIENT_ID = "YOUR_CLIENT_ID";
var CLIENT_SECRET = "YOUR_SECRET_KEY"
function yapi() {
    this.name = "yaksh";
}

yapi.prototype.login = function(username, password) {
    var data = "grant_type=password&username=" +username+ "&password="
        +password+ "&client_id=" +CLIENT_ID+ "&client_secret=" +CLIENT_SECRET;
    var url = URL_ROOT +"/o/token/";
    var method = "POST";
    var request = new XMLHttpRequest();
    request.open(method, url, false);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send(data);
    var state = request.status;
    var response = JSON.parse(request.responseText);
    if (state == 200) {
        var token = response.access_token
        _set_cookie("token=" + token)
    }
    return [state, response];
};

yapi.prototype.get_quizzes = function() {
    var url = URL_ROOT +"/api/quizzes/";
    var method = "GET";
    var header = ['Authorization', 'Bearer '+ _get_token()];
    var response = _request(null, method, url, header)
    return JSON.parse(response.responseText);
};

yapi.prototype.get_questions = function(quiz_id) {
    var url = URL_ROOT +"/api/questions/"+quiz_id+"/";
    var method = "GET";
    var header = ['Authorization', 'Bearer ' + _get_token()]
    var response = _request(null, method, url, header)
    return JSON.parse(response.responseText);
};

yapi.prototype.get_result = function() {
    var url = URL_ROOT +"/api/results/";
    var method = "GET";
    var header = ['Authorization', 'Bearer ' + _get_token()]
    var response = _request(null, method, url, header)
    return JSON.parse(response.responseText);
};

yapi.prototype.get_question = function(question_id) {
    var url = URL_ROOT +"/api/get_question/"+question_id+"/";
    var method = "GET";
    var header = ['Authorization', 'Bearer ' + _get_token()]
    var response = _request(null, method, url, header)
    if (response.status == 0) {
        return JSON.parse('{"message": "Server not ready"}');
    }
    if (response.status == 401) {
        return JSON.parse('{"message": "Login"}');
    }
    if (response.status == 404) {
        return JSON.parse('{"message": "Question not found"}');
    }
    return JSON.parse(response.responseText);
};

yapi.prototype.check_answer = function(question_paper_id, question_id, answer) {
    var data = '{"qp_id": ' +question_paper_id+ ', "question": ' +question_id+ ', "answer": ' +answer+ '}'
    var url = URL_ROOT +"/api/check_answer/";
    var method = "POST";
    var header = ['Authorization', 'Bearer ' + _get_token()]
    var response = _request(data, method, url, header)
    if (response.status == 401) {
        return JSON.parse('{"message": "Login"}');
    }
    return JSON.parse(response.responseText);
};

yapi.prototype.is_logged_in = function() {
    var token = _get_token();
    if (token!= null) {
        return true;
    }
    return false;
}

yapi.prototype.delete_cookie = function() {
    _delete_cookie();
}

function _set_cookie(value) {
    document.cookie = value;
}

function _delete_cookie() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}
function _get_token() {
    var cookies = document.cookie.split(';');
    for (var i=0; i<cookies.length; i++) {
        if (cookies[i].trim().match(/^token=/) != null) {
            return cookies[i].split('=')[1];
        }
    }
}

function _request(data, method, url, header) {
    var request = new XMLHttpRequest();
    request.open(method, url, false);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.setRequestHeader(header[0], header[1]);
    try {
        request.send(data);
    } catch(exception) {
        if (exception instanceof XMLHttpRequestException) {
            return request;
        }
    }
    return request;
}
