
function setCookie(name, value, expires, path, domain, secure) {
    var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    if (expires instanceof Date) {
        cookieText += '; expires=' + expires.toGMTString();
    }
    if (path) {
        cookieText += '; path=' + path;
    }
    if (domain) {
        cookieText += '; domain=' + domain;
    }
    if (secure) {
        cookieText += '; secure';
    }
    document.cookie = cookieText;
}
function removeCookie(name, path, domain, secure) {
    setCookie(name, '', new Date(0), path, domain, secure);
}
function getCookie(name) {
    var cookieName = encodeURIComponent(name) + '=',
        cookieStart = document.cookie.indexOf(cookieName),
        cookieValue = null;

    if (cookieStart > -1) {
        var cookieEnd = document.cookie.indexOf(';', cookieStart);
        if (cookieEnd == -1) {
            cookieEnd = document.cookie.length;
        }
        cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
    }
    return cookieValue;
}
function getUserInfo() {
    var token = getCookie("token");
    var payload = token.split('.')[1];
    var user = JSON.parse(new Base64().decode(payload));
    return user;
}

function copyText(data) {
    var tmpInput = document.createElement("input");
    tmpInput.value = data;
    tmpInput.style.position = "absolute";
    tmpInput.style.top = 0;
    tmpInput.style.left = 0;
    tmpInput.style.opacity = 0;
    tmpInput.style.zIndex = -10;
    document.body.appendChild(tmpInput);
    tmpInput.select();
    document.execCommand("copy");
    document.body.removeChild(tmpInput);
}

function copyMultiLineText(data) {
    var tmpInput = document.createElement('textarea');
    tmpInput.value = data;
    tmpInput.style.position = "absolute";
    tmpInput.style.top = 0;
    tmpInput.style.left = 0;
    tmpInput.style.opacity = 0;
    tmpInput.style.zIndex = -10;
    document.body.appendChild(tmpInput);
    tmpInput.select();
    document.execCommand("copy");
    document.body.removeChild(tmpInput);
}

function alertMsg(title, message, type) {
    Swal.fire(
        title,
        message,
        type
    );
}
function successAlert(title, message) {
    alertMsg(title, message, "success");
}
function errorAlert(title, message) {
    alertMsg(title, message, "error");
}
function successMsg(title) {
    Swal.fire({
        icon: 'success',
        title: title,
        showConfirmButton: false,
        timer: 1500
    });
}
function errorMsg(title) {
    Swal.fire({
        icon: 'error',
        title: title,
        showConfirmButton: false,
        timer: 1500
    });
}
function confirmMsg(title, message) {
    return new Promise((reslove, reject) => {
        Swal.fire({
            title: title,
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: "确定",
            cancelButtonText: "取消"

        }).then((result) => {
            if (result.value) {
                reslove();
            } else {
                reject();
            }
        }).catch(error => {
            reject(error);
        });
    });
}
