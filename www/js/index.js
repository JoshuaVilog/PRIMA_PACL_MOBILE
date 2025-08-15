
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
    audit.PopulateAudit($("#containerAuditChkList"));

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
});
$("#table-records").on("click", ".btnModify", function(){
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
    audit.PopulateAudit($("#containerAuditChkList"));
    $("#hiddenID").val(value.AUDIT_RID);

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    }); 
    
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
    let operator = $("#selectOperator").val();
    let auditList = getSelectedAudit();

    if(jobOrderNo == "" || shift == "" || judge == "" || lineLeader == "" || auditList.length == []){
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
            operator: operator == null ? "[]": JSON.stringify(operator),
            auditList: JSON.stringify(auditList)
        };

        // console.log(sendData);

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
        });

    }
    


});

function getSelectedAudit(){
    let values = $(".chkAudit:checked").map(function() {
        return $(this).val();
    }).get();  

    return values;

}
