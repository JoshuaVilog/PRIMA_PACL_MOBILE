class Main {

    constructor(){
        this.systemIP = "http://172.16.102.15:8080/";
        // this.systemIP = "http://172.16.1.13:8000/";
        this.systemLocalStorageTitle = "pacl";
        this.root = this.systemIP+"1_PACL/";
        this.lsUser = this.systemLocalStorageTitle +"-user"; // LOGIN USER
        this.lsEmployeeList = this.systemLocalStorageTitle +"-employee-list";
        this.lsAuditList = this.systemLocalStorageTitle +"-audit-list";
    }
    GetCurrentDate(){
        let currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
        let day = currentDate.getDate().toString().padStart(2, '0');
        let formattedDate = `${year}-${month}-${day}`;

        // console.log(formattedDate);  // Outputs something like: 2024-05-29
        return formattedDate;

    }

    GetEmployeeRecords(){
        let self = this;
        $.ajax({
            url: self.root + "php/controllers/Employee/EmployeeRecords.php",
            method: "POST",
            data: {},
            datatype: "json",
            success: function(list){

                localStorage.setItem(self.lsEmployeeList, JSON.stringify(list.data));
                // console.log(list.data);
            },
            error: function(err){
                console.log("Error:"+JSON.stringify(err));
            },
        });
    }
    GetAuditRecords(){
        let self = this;
        $.ajax({
            url: self.root + "php/controllers/Audit/Records.php",
            method: "POST",
            data: {},
            datatype: "json",
            success: function(list){

                localStorage.setItem(self.lsAuditList, JSON.stringify(list.data));
                // console.log(list.data);
            },
            error: function(err){
                console.log("Error:"+JSON.stringify(err));
            },
        });
    }
    GetShiftRecord(){
        let list = [
            {a:1, b:"DAYSHIFT", c:"DS"},
            {a:1, b:"NIGHTSHIFT", c:"NS"},
        ];

        return list;
    }
    GetJudgeRecord(){
        let list = [
            {a:1, b:"PASSED"},
            {a:2, b:"FAILED"},
        ];

        return list;
    }

    //////////// Login User Functions /////////////////////////
    CheckLoginUser(){
        let user = localStorage.getItem(this.lsUser);
        if(user){
            return JSON.parse(user);
        } else {
            return null;
        }
    }
    LoginUser(username, password, callback){
        let self = this;
        $.ajax({
            url: self.root + "php/controllers/User/Login.php",
            type: 'POST',
            data: {
                username: username,
                password: password
            },
            success: function(response) {
                let status = response.status;
                let list = response.data;

                if(status == "success"){
                    localStorage.setItem(self.lsUser, JSON.stringify(list));
                    callback(true);
                } else {
                    callback(false);
                }
            },
            error: function(response){
                callback(false);
            },
        });
    }
    LogOutUser(){
        localStorage.removeItem(this.lsUser);
        // location.assign("login.html");
        return true;
    }
    SetLoginName(){
        let user = this.CheckLoginUser();
        if(user){
            return user.EMPLOYEE_NAME;
        } else {
            return "";
        }
    }
    SetLoginRFID(){
        let user = this.CheckLoginUser();
        if(user){
            return user.RFID;
        } else {
            return "";
        }
    }
    /////////////////////////////////////////

    SetEmployeeName(id){
        let list = JSON.parse(localStorage.getItem(this.lsEmployeeList));
        
        if(id == 1){
            return "SYSTEM ADMIN"
        } else {
            let result = list.find(element => element.RFID === id);

            return result ? result.c: "";
        }
    }
    SetShift(id){
        let list = this.GetShiftRecord();
        let result = list.find(element => element.a === id);

        return result ? result.b: "";
    }
    SetJudge(id){
        let list = this.GetJudgeRecord();
        let result = list.find(element => element.a === id);

        return result ? result.b: "";
    }

    CheckUpdate(){
        /* console.log("Device is ready");
        var updateUrl = this.systemIP+"updates/OM_UPDATE/version.xml";

        window.AppUpdate.checkAppUpdate(onSuccess, onFail, updateUrl);

        function onFail(error) {
            console.log("App update check failed:", error);
        }
        function onSuccess(response) {
            console.log("App update check successful");
        } */
    }
    CheckConnection(callback){
        let self = this;
        $.ajax({
            url: self.root+'config/connectionTest.php',
            type: 'POST',
            data:{},
            success: function(response) {

                callback('<span class="text-success">'+response+'</span>');
    
            },
            error: function(response){
                callback('<span class="text-danger">ERROR CONNECTION</span>');
            },
        });
    }
    SetIP(){
        return this.systemIP;
    }
}

let main = new Main();

main.GetEmployeeRecords();
main.GetAuditRecords();

document.addEventListener('deviceready', function () {
    main.CheckUpdate();
}, false);


