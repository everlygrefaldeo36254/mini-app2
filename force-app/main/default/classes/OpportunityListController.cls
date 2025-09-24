public with sharing class OpportunityListController {

        @AuraEnabled(cacheable=true)
        public static List<Opportunity> getOpportunities(){
        List<Opportunity> opps=[Select Id,Name, StageName, Amount FROM Opportunity];
        return opps;

    }
}