(function (window){
    $("head").append('<link rel="stylesheet" type="text/css" href="'+ URL_ROOT +'/static/api/css/yaksh_design.css">');
    $yaksh = $("body");
    yaksha = new yapi()
    load_content();
    load_result();

    $yaksh.delegate('.check', 'click', function(){
        var qid =$(this).attr('data-id')
        var response = checkHandler($(this));
        if (response.message == "Login") {
            logout();
        }
        if(response.complete !== undefined && !response.complete) {
            var error_msg = response.message;
            $('#error'+qid).html('<p class="error">' +error_msg+ '</p>');
        }
        else if(response.complete !== undefined && response.complete){
            $(this).closest('div').append("<p>" +response.message+ "</p><hr>");
            $('#error'+qid).empty();
            $(this).remove();
        }
        if(response.quiz_complete !== undefined && response.quiz_complete) {
            load_result();
        }
    });

    $yaksh.delegate('.submit', 'click', function(){
        var index = $(this).attr('data-id');
        var username = $("#username"+index).val();
        var password = $("#password"+index).val();
        yaksha.login(username, password);
        load_content();
        load_result();
    });

    $yaksh.delegate('#logout', 'click', function() {
        logout();
    });

})(window);

function load_result() {
    if (yaksha.is_logged_in()) {
        var results = yaksha.get_result();
        resultHandler(results);
    } else {
            var login_html = designLogin(-1);
            append_to_div(document.getElementById("yaksh_results"), login_html)

    }
}

function load_content() {
    var $divs = $(".yaksh_test")
    $.each($divs, function(index, div) {
        if (yaksha.is_logged_in()) {
            var question_id = div.getAttribute('data-q_id');
            var question_paper_id = div.getAttribute('data-qp_id');
            question = retrieve_question(question_id)
            if (question.message == "Server not ready"){
                append_to_div(div, "<p>"+ question.message +"</p>")
            }
            else if (question.message == "Login") {
                yaksha.delete_cookie()
                var login_html = designLogin();
                append_to_div(div, login_html)
            }
            else if (question.message == "Question not found") {
                append_to_div(div, "<p>"+ question.message +"</p>")
            }
            else {
                content = "";
                if(question.type == 'mcq' || question.type == 'mcc') {
                    content = get_mcq_design(question, index+1)
                }
                if(question.type == 'code') {
                    content = get_code_design(question, index+1)
                }
                append_to_div(div, content)
            }
        } else {
            var login_html = designLogin(index);
            append_to_div(div, login_html)
        }
        });
}
function loginHandler () {
    var username = $("#username").val();
    var password = $("#password").val();
    yaksha.login(username, password);
    load_content();
    load_result();

}

function logout() {
    yaksha.delete_cookie();
    load_content();
    load_result();

}

    var qp_id = 1;
function createEditor(element) {
    return CodeMirror.fromTextArea(element, {});
}


function append_to_div(div, content) {
    div.innerHTML = content
}

function retrieve_questions(quiz_id) {
    return yaksha.get_questions(quiz_id)
}

function retrieve_question(question_id) {
    return yaksha.get_question(question_id)
}

function is_logged_in() {
    var token = yaksha.getToken();
    var request = null;
    if (token != null) {
        return true
    }
    else {
        return false
    }
}

function get_mcq_design(question, index) {
     var content = "<p><u>Question :" +index+ "</u><b> Mark(s):"+ question.points +"</b></br> " +question.description+ "</p>";
    if (question.type == 'mcq') {
        var name = "mcq"+question.id;
        var type = "radio";
    }
    else if(question.type == 'mcc') {
        var name = "mcc"+question.id;
        var type = "checkbox";
    }
    $.each(question.options, function(index, option){
        content += "<input type="+ type +" name="+ name +" value="+option+"> "+option+" <br>";
    } );
    content += "<button class='check' data-ap="+qp_id+" data-id="+question.id+" data-type=" +question.type+ "> Submit </button>"+ design_logout() +"<hr>";
    return content;
}

function get_code_design(question, index) {
     var content = "<p><u>Question :" +index+ "</u> <b>Mark(s):"+ question.points +"</b> </br>" +question.description+ "</p>";
    content += '<div id="error'+question.id +'" ></div>'
    content += '<textarea id=text'+ question.id +' class="text" placeholder="Write your code here." style="width: 600px;height: 400px;border: 3px solid #cccccc;padding: 5px;"></textarea><br>';
    content += "<button class='check' data-ap="+qp_id+" data-id="+question.id+" data-type=" +question.type+ "> Submit </button>"+ design_logout() +"<hr>";
    return content;
}

function designLogin(index) {
    var content = "<div class='yaksh'>Username: <input type='text' style='width:220px;height:30px' id='username"+ index +"'></input><br>"
                + "Password : <input type='password' id='password"+ index +"' style='width:220px;height:30px'></input><br>"
                + "<button class='submit' data-id="+ index+ "> Submit </button> <a href='"+ URL_ROOT +"/exam/register/' target='_blank'> Register on Yaksh </a></div>";
    return content;
}


function design_logout() {
    var content = "<button id='logout' style='float:right'> Logout </button>"
    return content
}

function checkHandler(submit) {
    var id = submit.closest('div').id
    var question =  submit.attr('data-id');
    var type =  submit.attr('data-type');
    var answer = "";
    if (type == "mcq") {
        answer = JSON.stringify($("input[name='mcq"+ question +"']:checked").val());
    }
    if (type == "mcc") {
        options = ""
        values = $("input[name='mcc"+ question +"']:checked");
        $.each(values, function(index, value){
            if (index == 0) {
                options += value.value;
            } else {
                options += ","+ value.value;
            }
        });
        answer = JSON.stringify(options);
    }
    if (type == "code") {
        answer = JSON.stringify(document.getElementById("text"+ question).value)
    }
    return yaksha.check_answer(qp_id, question, answer);
}

function resultHandler(results) {
    var content = "<table><th>Question Paper </th> <th> Attempt Number </th> <th> Percentage </th> <th> Status </th>"
    $.each(results, function(index, result){
        content += "<tr> <td>"+ result.question_paper +"</td> <td>"+ result.attempt_number +"</td> <td>"+ result.percent +"%</td>  <td>"+ result.status +"</td> </tr>"
    });
    content += "</table>"+ design_logout()
    append_to_div(document.getElementById("yaksh_results"), content);
}
