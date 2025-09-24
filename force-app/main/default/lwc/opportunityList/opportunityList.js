import { LightningElement,wire } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent'
import {NavigationMixin} from 'lightning/navigation';
import getOpportunities from '@salesforce/apex/OpportunityListController.getOpportunities';

export default class OpportunityList extends NavigationMixin(LightningElement) {
    @wire(getOpportunities) opportunityList;

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
            {label:'View',name:'view'}

        ];
        doneCallBack(actions);
    }
    handleView(event){
        event.preventDefault();   // 👈 stop the default button behavior
        event.stopPropagation();  // 👈 stop event bubbling just in case
        const oppId= event.target.dataset.id;
        const opp=this.opportunityList.find(o => o.Id ===oppId);
        console.log(opp.Id + ' ' + opp.Name);
    }
    viewItem(event){
        const record= event.detail.row;
        const actionName = event.detail.action.name;
        if(actionName==='view'){
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Opportunity Selected',
                message: `You clicked on ${record.Name} (${record.StageName})`,
                variant:'Info'
                })
            )
        }
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes:{
                recordId: record.Id,
                objectApiName:'Opportunity',
                actionName: 'view'
            }
        })


    }

}