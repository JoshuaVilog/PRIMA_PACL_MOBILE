class Audit extends Main{

    constructor(){
        super()
        this.tableDisplay = null;
    }

    DisplayRecords(tableElem, date){
        let self = this;

        $.ajax({
            url: self.root +"php/controllers/Audit/PlanRecords.php",
            method: "POST",
            data: {
                date: date,
            },
            datatype: "json",
            success: function(response){
                // console.log(response);
                let list = response.data;
                
                //generate tabulator
                self.tableDisplay = new Tabulator(tableElem,{
                    data: list,
                    pagination: "local",
                    paginationSize: 25,
                    paginationSizeSelector: [25, 50, 100],
                    page: 1,
                    // layout: "fitColumns",
                    layout:"fitDataFill",
                    responsiveLayout:"collapse",
                    columns: [
                        {title: "MACHINE", field: "MACHINE", headerFilter:true, headerFilterPlaceholder:"Search Machine",},
                        {title: "ITEM_CODE", field: "ITEM_CODE", },
                        {title: "ITEM_NAME", field: "ITEM_NAME", },
                        {title: "SHIFT", field: "SHIFT", formatter: function(cell){
                            return self.SetShift(parseInt(cell.getValue()));
                        }},
                        {title: "JOB_ORDER_NO", field: "JOB_ORDER_NO", visible: false},
                        {title: "JUDGE", field: "JUDGE", formatter: function(cell){
                            return self.SetJudge(parseInt(cell.getValue()));
                        },},
                        {title: "ACTION", field: "id", formatter:function(cell){
                            let id = cell.getValue();
                            let rowData = cell.getRow().getData();
                            let rowDataStr = encodeURIComponent(JSON.stringify(rowData));

                            let set = '<button class="btn btn-success btn-minier btnSet" value="'+rowDataStr+'">Set Audit</button>';
                            let modify = '<button class="btn btn-warning btn-minier btnModify" value="'+rowData.AUDIT_RID+'">Modify</button>';
                            
                            if(rowData.JUDGE == 0){
                                return set;
                            } else {
                                return "-";
                            }
                        }},
                    ],
                });
                
            },
            error: function(err){
                console.log("Error:"+JSON.stringify(err));
            },
        });
    }

    PopulateShift(selectElem, id){
        let list = this.GetShiftRecord();
        let options = '<option value="">-Select Shift-</option>';

        list.forEach(element => {
            let selected = (element.id === id && id != undefined) ? 'selected' : '';
            options += `<option value="${element.a}" ${selected}>${element.b}</option>`;
        });

        selectElem.html(options);
    }
    PopulateJudge(selectElem, id){
        let list = this.GetJudgeRecord();
        let options = '<option value="">-Select Judge-</option>';

        list.forEach(element => {
            let selected = (element.id === id && id != undefined) ? 'selected' : '';
            options += `<option value="${element.a}" ${selected}>${element.b}</option>`;
        });

        selectElem.html(options);
    }

    PopulateLineLeader(selectElem, rfid){
        let list = JSON.parse(localStorage.getItem(this.lsEmployeeList)) || [];
        let options = '<option value="">-Select Line Leader-</option>';

        list.forEach(element => {
            if(element.RFID != 1){ // Exclude SYSTEM ADMIN
                let selected = (element.RFID === rfid || rfid != undefined) ? 'selected' : '';
                options += `<option value="${element.RFID}" ${selected}>${element.EMPLOYEE_NAME}</option>`;
            }
        });

        selectElem.html(options);
        selectElem.select2({
            placeholder: "-Select Line Leader-",
            width: '100%'
        });
    }
    PopulateOperator(selectElem, rfid){
        let list = JSON.parse(localStorage.getItem(this.lsEmployeeList)) || [];
        let options = '<option value="">-Select Operator-</option>';

        list.forEach(element => {
            if(element.RFID != "1"){ // Exclude SYSTEM ADMIN
                let selected = (element.RFID === rfid || rfid != undefined) ? 'selected' : '';
                options += `<option value="${element.RFID}" ${selected}>${element.EMPLOYEE_NAME}</option>`;
            }
        });

        selectElem.html(options);
        selectElem.select2({
            placeholder: "-Select Operator-",
            width: '100%'
        });
    }
    PopulateAudit(selectElem, array){
        let list = JSON.parse(localStorage.getItem(this.lsAuditList)) || [];
        let options = '';
        array = (array != undefined) ? JSON.parse(array) : [];

        list.forEach(element => {
            let checked = '';
            for(let i = 0; i < array.length; i++){
                if(element.RID === array[i]){
                    checked = 'checked';
                    break;
                }
            }
            options += '<div class="checkbox"> <label><input type="checkbox" class="chkAudit" value="'+element.RID+'" '+checked+'>'+element.AUDIT_CODE+' - '+element.AUDIT_DESC+'</label> </div>';
        });
        

        selectElem.html(options);
    }
    InsertAuditRecord(data, callback){
        let self = this;

        data.userCode = self.CheckLoginUser().RFID;
        
        console.log(data);
        $.ajax({
            url: self.root + "php/controllers/Audit/InsertAuditMasterlist.php",
            method: "POST",
            data: data,
            datatype: "json",
            success: function(response){
                console.log(response);
                response = JSON.parse(response);

                callback(response)
            },
            error: function(err){
                console.log("Error:"+JSON.stringify(err));
                callback(response);
            },
        });
    }

   

}