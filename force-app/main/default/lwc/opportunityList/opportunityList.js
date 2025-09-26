import { LightningElement,wire,track } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent'
import {NavigationMixin} from 'lightning/navigation';
import getOpportunities from '@salesforce/apex/OpportunityListController.getOpportunities';
import {updateRecord,deleteRecord} from 'lightning/uiRecordApi';
import {refreshApex} from '@salesforce/apex'
import StageName from '@salesforce/schema/Opportunity.StageName';
import LightningConfirm from 'lightning/confirm'

export default class OpportunityList extends NavigationMixin(LightningElement) {
    @wire(getOpportunities) opportunityList;
        isModalOpen =false;
        selectedRecord;
        stageValue;


    columns= [
        {label:'Name',fieldName: 'Name', type:'text'},
        {label:'StageName',fieldName: 'StageName', type:'text'},
        {label:'Amount',fieldName: 'Amount', type:'currency'},
        {
            type: 'action',
            typeAttributes: {rowActions: this.getRowActions}
        }
    ];

    getRowActions(row,doneCallBack){
        const actions = [
            {label:'View',name:'view'},
            {label:'Edit Stage',name:'editStage'},
            {label:'Delete Record',name:'deleteRecord'}

        ];
        doneCallBack(actions);
    }

    handleRowAction(event){
        const record= event.detail.row;
        const actionName = event.detail.action.name;
        if(actionName==='view'){
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Opportunity Selected',
                message: `You clicked on ${record.Name} (${record.StageName})`,
                variant:'Info'
                })
            );
            this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes:{
                recordId: record.Id,
                objectApiName:'Opportunity',
                actionName: 'view'
            }
        });

        }
        if(actionName==='editStage'){
            this.selectedRecord =record;
            this.stageValue=record.StageName;
            this.isModalOpen = true;

        }
        if(actionName==='deleteRecord'){
            this.selectedRecord =record;
            this.confirmAndDelete(record.Id,record.Name);
           
        }

    }
    async confirmAndDelete(recordId,recordName){
        const confirmed =await LightningConfirm.open({
            message:`Are you sure you want to delete ${recordName}?`,
            label:'Confirm Deletion',
            theme:'error'
        });

        if(confirmed){
            deleteRecord(recordId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title:'Delete',
                        message: `${recordName} deleted successfully`,
                        variant:'success'
                    })
                );
                 return refreshApex(this.opportunityList);
            })
            .catch(error =>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title:'Error deleting record',
                        message: error.body.message,
                        variant:'error'
                    })
                );
      
            });
        }else{
            console.log('User canceled deletion');
        }

    }
    handleStageChange(event){
        this.stageValue=event.target.value;

    }
    closeModal(){
        this.isModalOpen=false;
    }
    get stageOptions(){
        return [
            {label: 'Prospecting', value: 'Prospecting'},
            {label: 'Qualification', value: 'Qualification'},
            {label: 'Needs Analysis', value: 'Needs Analysis'},
            {label: 'Value Proposition', value: 'Value Proposition'},
            {label: 'Closed Won', value: 'Closed Won'},
            {label: 'Closed Lost', value: 'Closed Lost'},
        ]
    }
    handleSave(){
        const fields = {
            Id: this.selectedRecord.Id,
            StageName: this.stageValue
        };
        updateRecord({fields})
            .then(
                ()=> {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message:'Opportunity Stage updated',
                            variant:'success'
                        })
                    );
                    this.isModalOpen=false;
                    return refreshApex(this.opportunityList);
                }
            )
            .catch(error =>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            }

            );
    }
    handleDelete(){
        if(this.selectedRecord){
            this.confirmAndDelete(this.selectedRecord.Id,this.selectedRecord.Name);
        }

    }


}