
$("#displayLoginName").text(main.SetLoginName());
$("#txtUser").val(main.SetLoginRFID());

$("#btnRefresh").click(function(){

    window.location.reload();
    
});
$("#btnOpenModalConnection").click(function(){
    main.CheckConnection(function(response){

        $("#modalConnection").modal("show");
        $("#displayConnectionStatus").html(response);
        $("#displayIP").text(main.SetIP());
    })
});

$("#btnCheckConnection").click(function(){

    $("#displayConnectionStatus").html("-");
    $("#displayIP").html("-");

    setTimeout(() => {
        main.CheckConnection(function(response){

            $("#displayConnectionStatus").html(response);
            $("#displayIP").text(main.SetIP());
        })
    }, 1000);
});
$("#btnLogOut").click(function(){
    Swal.fire({
        title: 'Logout',
        text: 'Are you sure you want to logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout!'
    }).then((result) => {
        if (result.isConfirmed) {
            main.LogOutUser();
            location.assign("login.html");
        }
    })
});

//////////////////////////////////////////////////////////////////////////////////////
let audit = new Audit();

$("#txtDate").val(main.GetCurrentDate());


setTimeout(() => {

    audit.DisplayRecords("#table-records", $("#txtDate").val());
}, 500);

$("#txtDate").change(function(){
    let date = $(this).val();
    if(date == ""){
        date = main.GetCurrentDate();
    }

    audit.DisplayRecords("#table-records", date);
    $("#formAudit").hide();
});

$("#table-records").on("click", ".btnSet", function(){
    let value = JSON.parse(decodeURIComponent($(this).val()));
    $("#formAudit").show();

    $("#txtMachine").val(value.MACHINE);
    $("#txtJobOrder").val(value.JOB_ORDER_NO);
    $("#txtItemCode").val(value.ITEM_CODE);
    $("#txtItemName").val(value.ITEM_NAME);
    $("#txtModel").val(value.MODEL);
    $("#txtAuditDate").val(value.DATE);
    audit.PopulateShift($("#selectShift"), value.SHIFT);
    audit.PopulateJudge($("#selectJudge"), value.JUDGE);
    audit.PopulateLineLeader($("#selectLineLeader"), value.LINE_LEADER);
    audit.PopulateOperator($("#selectOperator"), value.OPERATOR);
    audit.PopulateIPQC($("#selectIPQC"), value.IPQC);
    audit.PopulateTechnician($("#selectTechnician"), value.TECHNICIAN);
    audit.PopulateAudit($("#containerAuditChkList"));
    $("#hiddenID").val(value.AUDIT_RID);
    $("#txtTimeIn").val(main.GetPhilippinesDateTime());

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
});
$("#table-records").on("click", ".btnModify", function(){
    $("#modalEditAudit").modal("show");
    let value = JSON.parse(decodeURIComponent($(this).val()));

    audit.DisplayAuditByJobOrder("#table-edit-audit", value.JOB_ORDER_NO);
});
$("#table-edit-audit").on("click", ".btnModify", function(){
    $("#modalEditAudit").modal("hide");
    let value = JSON.parse(decodeURIComponent($(this).val()));

    console.log(value);
    $("#txtMachine").val(value.MACHINE);
    $("#txtJobOrder").val(value.JOB_ORDER_NO);
    $("#txtItemCode").val(value.ITEM_CODE);
    $("#txtItemName").val(value.ITEM_NAME);
    $("#txtModel").val(value.MODEL);
    $("#txtAuditDate").val(value.DATE);
    audit.PopulateShift($("#selectShift"), parseInt(value.SHIFT));
    audit.PopulateJudge($("#selectJudge"), parseInt(value.JUDGE));
    audit.PopulateLineLeader($("#selectLineLeader"), value.LINE_LEADER);
    audit.PopulateOperator($("#selectOperator"), value.OPERATOR);
    audit.PopulateIPQC($("#selectIPQC"), value.IPQC);
    audit.PopulateTechnician($("#selectTechnician"), value.TECHNICIAN);
    audit.PopulateAudit($("#containerAuditChkList"), value.AUDIT_CHECKLIST);
    $("#txtTimeIn").val(value.TIME_IN);
    $("#hiddenID").val(value.RID);

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    }); 

    $("#formAudit").show();
    $("#btnUpdate").show();
    $("#btnSubmit").hide();
});
$("#containerAuditChkList").on("click", ".rdoAudit", function(){
    let value = $(this).val();

    $(this).closest(".trRow").find(".hiddenAudit").val(value);
});

$("#btnCancel").click(function(){
    $("#formAudit").hide();
})
$("#btnSubmit").click(function(){
    let machine = $("#txtMachine").val();
    let jobOrderNo = $("#txtJobOrder").val();
    let itemCode = $("#txtItemCode").val();
    let itemName = $("#txtItemName").val();
    let model = $("#txtModel").val();
    let date = $("#txtAuditDate").val();
    let shift = $("#selectShift").val();
    let judge = $("#selectJudge").val();
    let lineLeader = $("#selectLineLeader").val();
    let ipqc = $("#selectIPQC").val();
    let technician = $("#selectTechnician").val();
    let operator = $("#selectOperator").val();
    let auditList = getSelectedAudit();
    let timeIn = $("#txtTimeIn").val();
    let id = $("#hiddenID").val();

    if(jobOrderNo == "" || shift == "" || judge == "" || lineLeader == "" || auditList == false){
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please fill all the fields.',
        });
        return;
    }   else {
        let sendData = {
            machine: machine,
            jobOrderNo: jobOrderNo,
            itemCode: itemCode,
            itemName: itemName,
            model: model,
            date: date,
            shift: shift,
            judge: judge,
            lineLeader: lineLeader,
            ipqc: ipqc,
            technician: technician,
            operator: operator == null ? "[]": JSON.stringify(operator),
            auditList: JSON.stringify(auditList),
            timeIn: timeIn,
            id: id,
        };

        console.log(sendData);
        $("#spinner").show();
        $("#btnSubmit").prop("disabled", true);

        audit.InsertAuditRecord(sendData, function(response){

            if(response.status === "success"){
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Audit submitted successfully.',
                });
                $("#formAudit").hide();
                audit.DisplayRecords("#table-records", $("#txtDate").val());

            } else if(response.status == "duplicate"){
                Swal.fire({
                    icon: 'warning',
                    title: 'Duplicate Entry',
                    text: response.message,
                });
            } else if(response.status === "error"){
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message,
                });
            }
            $("#spinner").hide();
            $("#btnSubmit").prop("disabled", false);
        });

    }
});

$("#btnUpdate").click(function(){
    let machine = $("#txtMachine").val();
    let jobOrderNo = $("#txtJobOrder").val();
    let itemCode = $("#txtItemCode").val();
    let itemName = $("#txtItemName").val();
    let model = $("#txtModel").val();
    let date = $("#txtAuditDate").val();
    let shift = $("#selectShift").val();
    let judge = $("#selectJudge").val();
    let lineLeader = $("#selectLineLeader").val();
    let ipqc = $("#selectIPQC").val();
    let technician = $("#selectTechnician").val();
    let operator = $("#selectOperator").val();
    let auditList = getSelectedAudit();
    let timeIn = $("#txtTimeIn").val();
    let id = $("#hiddenID").val();

    if(jobOrderNo == "" || shift == "" || judge == "" || lineLeader == "" || auditList == false){
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please fill all the fields.',
        });
        return;
    }   else {
        let sendData = {
            machine: machine,
            jobOrderNo: jobOrderNo,
            itemCode: itemCode,
            itemName: itemName,
            model: model,
            date: date,
            shift: shift,
            judge: judge,
            lineLeader: lineLeader,
            ipqc: ipqc,
            technician: technician,
            operator: operator == null ? "[]": JSON.stringify(operator),
            auditList: JSON.stringify(auditList),
            timeIn: timeIn,
            id: id,
        };

        console.log(sendData);
        $("#spinner").show();
        $("#btnUpdate").prop("disabled", true);

        audit.UpdateAuditRecord(sendData, function(response){

            if(response.status === "success"){
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Audit updated successfully.',
                });
                $("#formAudit").hide();
                audit.DisplayRecords("#table-records", $("#txtDate").val());

            } else if(response.status == "duplicate"){
                Swal.fire({
                    icon: 'warning',
                    title: 'Duplicate Entry',
                    text: response.message,
                });
            } else if(response.status === "error"){
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message,
                });
            }
            $("#formAudit").hide();
            $("#spinner").hide();
            $("#btnUpdate").prop("disabled", false);
            $("#btnUpdate").hide();
            $("#btnSubmit").show();
        });

    }
});


// WALA NA TO
$("#containerAuditChkList").on("click", ".chkAudit", function(){
    const container = document.getElementById("containerAuditChkList");
    const checkboxes = container.querySelectorAll('.chkAudit');
    let allChecked = true; // Assume all are checked initially
    checkboxes.forEach(cb => {
        //if cb has false
        if (!cb.checked) {
            allChecked = false; // If any checkbox is unchecked, set to false
        }
    });

    if(allChecked === true){
        $("#selectJudge").val("1");
    } else if(allChecked == false){
        $("#selectJudge").val("2");
    }

    // console.log(allChecked);
});

$("#containerAuditChkList").on("click", ".rdoAudit", function(){
    let isEmpty = checkAuditIsEmpty();

    if(isEmpty === false){
        $("#selectJudge").val("1");
    } else if(isEmpty === true){
        $("#selectJudge").val("2");
    }
});

function getSelectedAudit(){
    let isEmpty = false;
    let values = $(".hiddenAudit").map(function() {
        if($(this).val() == ""){
            isEmpty = true;
        }

        return $(this).val();
    }).get();  

    // return values;
    if(isEmpty === true){
        return false;
    } else if(isEmpty === false){
        return values;
    }
}
function checkAuditIsEmpty(){
    let isEmpty = false;
    let values = $(".hiddenAudit").map(function() {
        if($(this).val().split("_")[1] == "X"){
            isEmpty = true;
        }
    }).get();  

    return isEmpty;
}

$("#liViewHistory").click(function(){

    audit.GetHistoryRecords("#table-history", $("#txtDate").val());
});
