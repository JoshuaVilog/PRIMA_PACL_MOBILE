class Audit extends Main{

    constructor(){
        super()
        this.tableDisplay = null;
        this.table2 = null;
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
                console.log(response);
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
                        {title: "MACHINE", field: "MACHINE", headerFilter:true, headerFilterPlaceholder:"Search Machine", resizable:false, },
                        {title: "ITEM_CODE", field: "ITEM_CODE", resizable:false, },
                        {title: "ITEM_NAME", field: "ITEM_NAME", headerHozAlign:"right",},
                        {title: "SHIFT", field: "SHIFT", headerHozAlign:"right", formatter: function(cell){
                            let value = cell.getValue();
                            return (value == 0) ? "-" : self.SetShift(parseInt(value));
                        }},
                        {title: "JOB_ORDER_NO", field: "JOB_ORDER_NO", visible: false},
                        {title: "JUDGE", field: "JUDGE", headerHozAlign:"right", formatter: function(cell){
                            let value = cell.getValue();
                            let color = (value == "1") ? "success" : "danger";
                            return (value == 0) ? "-" : '<strong class="text-'+color+'">'+ self.SetJudge(parseInt(value))+'</strong>';
                        },},
                        {title: "AUDIT BY", field: "CREATED_BY", headerHozAlign:"right", formatter: function(cell){
                            let value = cell.getValue();
                            return (value == 0) ? "-" : self.SetEmployeeNameByRFID(value);
                        },},
                        {title: "AUDIT AT", field: "CREATED_AT", headerHozAlign:"right", formatter: function(cell){
                            let value = cell.getValue();
                            return (value == "") ? "-" : value;
                        },},
                        {title: "ACTION", field: "id", headerHozAlign:"right", formatter:function(cell){
                            let id = cell.getValue();
                            let rowData = cell.getRow().getData();
                            let rowDataStr = encodeURIComponent(JSON.stringify(rowData));

                            let set = '<button class="btn btn-success btn-sm btnSet" value="'+rowDataStr+'">Set Audit</button>';
                            let modify = '<button class="btn btn-primary btn-sm btnModify" value="'+rowDataStr+'">Modify</button>';
                            
                            if(rowData.JUDGE == 0){
                                return set;
                            } else {
                                return set +" "+modify;
                            }
                            // return set;
                        }},
                    ],
                });
                
            },
            error: function(err){
                console.log("Error:"+JSON.stringify(err));
            },
        });
    }
    DisplayAuditByJobOrder(tableElem, jobOrderNo){
        let self = this;

        $.ajax({
            url: self.root +"php/controllers/Audit/AuditMasterlistRecordsByJobOrder.php",
            method: "POST",
            data: {
                jobOrderNo: jobOrderNo,
            },
            datatype: "json",
            success: function(response){

                // console.log(response);

                self.table2 = new Tabulator(tableElem, {
                    data: response.data,
                    layout:"fitDataFill",
                    responsiveLayout:"collapse",
                    columns: [
                        {title: "MACHINE", field: "MACHINE", headerFilter:true, headerFilterPlaceholder:"Search Machine", resizable:false, },
                        {title: "ITEM_CODE", field: "ITEM_CODE", resizable:false, },
                        {title: "ITEM_NAME", field: "ITEM_NAME", headerHozAlign:"right",},
                        {title: "SHIFT", field: "SHIFT", headerHozAlign:"right", formatter: function(cell){
                            let value = cell.getValue();
                            return (value == 0) ? "-" : self.SetShift(parseInt(value));
                        }},
                        {title: "JOB_ORDER_NO", field: "JOB_ORDER_NO", visible: false},
                        {title: "JUDGE", field: "JUDGE", headerHozAlign:"right", formatter: function(cell){
                            let value = cell.getValue();
                            let color = (value == "1") ? "success" : "danger";
                            return (value == 0) ? "-" : '<strong class="text-'+color+'">'+ self.SetJudge(parseInt(value))+'</strong>';
                        },},
                        {title: "AUDIT BY", field: "CREATED_BY", headerHozAlign:"right", formatter: function(cell){
                            let value = cell.getValue();
                            return (value == 0) ? "-" : self.SetEmployeeNameByRFID(value);
                        },},
                        {title: "AUDIT AT", field: "CREATED_AT", headerHozAlign:"right", formatter: function(cell){
                            let value = cell.getValue();
                            return (value == "") ? "-" : value;
                        },},
                        {title: "ACTION", field: "id", headerHozAlign:"right", formatter:function(cell){
                            let id = cell.getValue();
                            let rowData = cell.getRow().getData();
                            let rowDataStr = encodeURIComponent(JSON.stringify(rowData));

                            let set = '<button class="btn btn-primary btn-sm btnModify" value="'+rowDataStr+'">Modify Audit</button>';
                            
                            return set;
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
            let selected = (element.a === id && id != undefined) ? 'selected' : '';
            
            console.log(element.a);
            options += `<option value="${element.a}" ${selected}>${element.b}</option>`;
        });

        selectElem.html(options);
    }
    PopulateJudge(selectElem, id){
        let list = this.GetJudgeRecord();
        let options = '<option value="">-Select Judge-</option>';

        list.forEach(element => {
            let selected = (element.a === id && id != undefined) ? 'selected' : '';
            options += `<option value="${element.a}" ${selected}>${element.b}</option>`;
        });

        selectElem.html(options);
    }

    PopulateLineLeader(selectElem, rfid){
        let list = JSON.parse(localStorage.getItem(this.lsEmployeeList)) || [];
        let options = '<option value="">-Select Line Leader-</option>';

        list.forEach(element => {
            if(element.DEPARTMENT_ID == 8 && element.ACTIVE == 1){ // Exclude SYSTEM ADMIN
                let selected = (element.RFID === rfid && rfid != undefined) ? 'selected' : '';
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
        rfid = (rfid != undefined) ? JSON.parse(rfid) : [];
        let options = '<option value="">-Select Operator-</option>';

        list.forEach(element => {
            if(element.DEPARTMENT_ID == 8 && element.ACTIVE == 1){ // Exclude SYSTEM ADMIN
                // let selected = (element.RFID === rfid && rfid != undefined) ? 'selected' : '';
                let selected = '';
                for(let j = 0; j < rfid.length; j++){
                    if(element.RFID === rfid[j]){
                        selected = 'selected';
                        break;
                    }
                }
                options += `<option value="${element.RFID}" ${selected}>${element.EMPLOYEE_NAME}</option>`;
            }
        });

        selectElem.html(options);
        setTimeout(() => {
            selectElem.select2({
                placeholder: "-Select Operator-",
                width: '100%'
            });
        }, 500);
        
    }
    PopulateIPQC(selectElem, rfid){
        let list = JSON.parse(localStorage.getItem(this.lsEmployeeList)) || [];
        let options = '<option value="">-Select Operator-</option>';

        list.forEach(element => {
            if(element.DEPARTMENT_ID == 6 && element.ACTIVE == 1){ // Exclude SYSTEM ADMIN
                let selected = (element.RFID === rfid && rfid != undefined) ? 'selected' : '';
                options += `<option value="${element.RFID}" ${selected}>${element.EMPLOYEE_NAME}</option>`;
            }
        });

        selectElem.html(options);
        selectElem.select2({
            placeholder: "-Select IPQC-",
            width: '100%'
        });
    }
    PopulateTechnician(selectElem, rfid){
        let list = JSON.parse(localStorage.getItem(this.lsEmployeeList)) || [];
        let options = '<option value="">-Select Operator-</option>';

        list.forEach(element => {
            if(element.DEPARTMENT_ID == 8 && element.ACTIVE == 1){ // Exclude SYSTEM ADMIN
                let selected = (element.RFID === rfid && rfid != undefined) ? 'selected' : '';
                options += `<option value="${element.RFID}" ${selected}>${element.EMPLOYEE_NAME}</option>`;
            }
        });

        selectElem.html(options);
        selectElem.select2({
            placeholder: "-Select Technician-",
            width: '100%'
        });
    }
    PopulateTPM(selectElem, rfid){
        let list = JSON.parse(localStorage.getItem(this.lsEmployeeList)) || [];
        let options = '<option value="">-Select TPM-</option>';

        list.forEach(element => {
            if(element.DEPARTMENT_ID == 8 && element.ACTIVE == 1){ // Exclude SYSTEM ADMIN
                let selected = (element.RFID === rfid && rfid != undefined) ? 'selected' : '';
                options += `<option value="${element.RFID}" ${selected}>${element.EMPLOYEE_NAME}</option>`;
            }
        });

        selectElem.html(options);
        selectElem.select2({
            placeholder: "-Select TPM-",
            width: '100%'
        });
    }
    PopulateMaterialHandler(selectElem, rfid){
        let list = JSON.parse(localStorage.getItem(this.lsEmployeeList)) || [];
        let options = '<option value="">-Select Material Handler-</option>';

        list.forEach(element => {
            if(element.DEPARTMENT_ID == 8 && element.ACTIVE == 1){ // Exclude SYSTEM ADMIN
                let selected = (element.RFID === rfid && rfid != undefined) ? 'selected' : '';
                options += `<option value="${element.RFID}" ${selected}>${element.EMPLOYEE_NAME}</option>`;
            }
        });

        selectElem.html(options);
        selectElem.select2({
            placeholder: "-Select Material Handler-",
            width: '100%'
        });
    }
    PopulateAudit(selectElem, array){
        let list = JSON.parse(localStorage.getItem(this.lsAuditList)) || [];
        let options = '';
        array = (array != undefined) ? JSON.parse(array) : [];
        let listAuditCategory = this.GetAuditCategory();

        for(let i = 0; i < listAuditCategory.length; i++){

            // options += '<label><strong>-'+listAuditCategory[i].b+'-</strong></label>'
            options += '<tr> <td colspan="2" class="tdCategory text-center" style="color: #ffffff;background-color:'+listAuditCategory[i].c+'"> <strong>-'+listAuditCategory[i].b+'-</strong> </td> </tr>'
        
            list.forEach(element => {
                if(listAuditCategory[i].a == element.CATEGORY){
                    // let checked = '';
                    let status = '';

                    for(let j = 0; j < array.length; j++){
                        let audit = array[j].split("_")[0];

                        if(element.RID === audit){
                            // checked = 'checked';
                            status = array[j];
                            break;
                        }
                    }
                    // options += '<div class="checkbox"> <label><input type="checkbox" class="chkAudit" value="'+element.RID+'" '+checked+'>'+element.AUDIT_CODE+' - '+element.AUDIT_DESC+'</label> </div>';

                    let optO = (element.RID+"_O" == status)? 'checked':'';
                    let optX = (element.RID+"_X" == status)? 'checked':'';
                    let optN = (element.RID+"_N" == status)? 'checked':'';

                    options += '<tr class="trRow"> <td> <div class="radio"> <label><input type="radio" name="rdo'+element.RID+'" value="'+element.RID+'_O" class="rdoAudit" '+optO+' >YES</label> </div> <div class="radio"> <label><input type="radio" name="rdo'+element.RID+'" value="'+element.RID+'_X" class="rdoAudit" '+optX+'>NO</label> </div> <div class="radio"> <label><input type="radio" name="rdo'+element.RID+'" value="'+element.RID+'_N" class="rdoAudit" '+optN+'>NA</label> </div> </td> <td>'+element.AUDIT_CODE+' - '+element.AUDIT_DESC+'<input type="hidden" class="hiddenAudit" value="'+status+'"> </td> </tr>'
                }
            });
        }
        
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
    UpdateAuditRecord(data, callback){
        let self = this;

        data.userCode = self.CheckLoginUser().RFID;
        
        console.log(data);
        $.ajax({
            url: self.root + "php/controllers/Audit/UpdateAuditMasterlist.php",
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

    GetHistoryRecords(tableElem, date){
        let self = this;

        $.ajax({
            url: self.root+"php/controllers/Audit/AuditMasterlistRecords.php",
            method: "POST",
            data: {
                startDate: date,
                endDate: date,
            },
            datatype: "json",
            success: function(response){
                console.log(response);
                let list = response.data;

                list.forEach(function (row) {
                    // row.SHIFT = self.SetShift(parseInt(row.SHIFT));
                    row.JUDGE = self.SetJudge(parseInt(row.JUDGE));
                    row.LINE_LEADER = self.SetEmployeeNameByRFID(row.LINE_LEADER);
                    row.IPQC = self.SetEmployeeNameByRFID(row.IPQC);
                    row.TECHNICIAN = self.SetEmployeeNameByRFID(row.TECHNICIAN);
                    row.CREATED_BY = self.SetEmployeeNameByRFID(row.CREATED_BY);
                });

                self.tableDisplay = new Tabulator(tableElem,{
                    data: list,
                    pagination: "local",
                    paginationSize: 25,
                    paginationSizeSelector: [25, 50, 100],
                    page: 1,
                    // layout: "fitColumns",
                    layout:"fitDataFill",
                    columns: [
                        {title: "MACHINE", field: "MACHINE", headerFilter:true, resizable:false, formatter: function(cell){
                            cell.getElement().style.backgroundColor = "#ffffff";
                            return cell.getValue();
                        }, },
                        {title: "ITEM_CODE", field: "ITEM_CODE", headerFilter:true, resizable:false,  formatter: function(cell){
                            cell.getElement().style.backgroundColor = "#ffffff";
                            return cell.getValue();
                        },},
                        {title: "ITEM_NAME", field: "ITEM_NAME", headerFilter:true, resizable:false, formatter: function(cell){
                            cell.getElement().style.backgroundColor = "#ffffff";
                            return cell.getValue();
                        },},
                        {title: "JUDGE", field: "JUDGE", headerFilter:true, frozen: true, resizable:false, formatter: function(cell){
                            let value = cell.getValue();
    
                            if(value == "PASSED"){
                                cell.getElement().style.backgroundColor = "#08A04B";
                            } else if(value == "FAILED") {
                                cell.getElement().style.backgroundColor = "#F75D59";
                            }
    
                            cell.getElement().style.color = "#F5F5F5";
                            return '<span>'+value+'</span>';
                        }},
                        {title: "DATETIME", field: "CREATED_AT", headerFilter:true, resizable:false,},
                        {title: "AUDITED BY", field: "CREATED_BY", headerFilter:true, resizable:false,},
                        {title: "LINE LEADER", field: "LINE_LEADER", headerFilter:true, resizable:false,},
                        {title: "IPQC", field: "IPQC", headerFilter:true, resizable:false,},
                        {title: "TECHNICIAN", field: "TECHNICIAN", headerFilter:true, resizable:false,},
                    ],
                });

            },
            error: function(err){
                console.log("Error:"+JSON.stringify(err));
            },
        });
    }

   

}