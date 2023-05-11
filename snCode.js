// onChange cat CS to refresh field values dependant on a select box

function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading ) {
        return;
    }
    var ukRDC = 'Measurlink (for RDN/RDC network clients) v8';
    var ukCME = 'Measurlink (for CME manufacturing clients) v8';
    var other = 'Measurlink (including Real-Time Professional, Process Analyser, Gage R&R, Gage Management) v8';
	
    if (newValue == 'uk_cme' ) {
		g_form.setValue('required_software', ukCME);
	}  else if (newValue == 'uk_rdc') {
		g_form.setValue('required_software', ukRDC);
	} else if (newValue != 'uk_cme' && newValue != 'uk_rdc' && newValue !="") {
		g_form.setValue('required_software', other);
	}else {
		g_form.setValue('required_software','');
	}

}


//close ritm when all sctask are done  for RR cat items

// input ritm_sys_id
// output all_tasks_complete - string

(function execute(inputs, outputs) {
	// ... code ...
		var gr = new GlideRecord('sc_task');
	gr.addQuery('request_item', inputs.ritm_sys_id);
	  gr.addQuery('state', '4');
	gr.query();
	if (gr.next()) {    
			outputs.all_tasks_complete = "No";    
	}
	 
	  
	})(inputs, outputs);

	/* if incomplete tasks found 
		then update record 
				end

		update record*/


// check for the group of the requesting user

(function execute(inputs, outputs) {
// ... code ...
    var gr = new GlideRecord('sys_user_grmember');
  gr.addQuery('user', inputs.reqfor_sys_id );
  gr.addQuery('group', '09f038fd1b2738108225a822b24bcbdb');
  gr.query();
  if(gr.next()){
    outputs.user_is_secure = "Yes"; 
  }
 else {
   outputs.user_is_secure = "No"; 
      }
  
})(inputs, outputs);

// input  reqfor_sys_id
// output  user_is_secure


// add/remove role to a user - flow action 
(function execute(inputs, outputs) {
	// ... code ...  
	  if(inputs.add_remove == "add"){
		gs.log("Add script");
		var update = new GlideRecord('sys_user_has_role');
		update.initialize();
		update.user = inputs.reqfor_sys_id;
		update.role = '75bb81191b7f30100ddc7662164bcb7a';
		update.insert();
	  }
	  else{   
		gs.log("Remove script");
	  var gr = new GlideRecord('sys_user_has_role');
	  gr.addQuery('user', inputs.reqfor_sys_id);
	  gr.addQuery('role', '75bb81191b7f30100ddc7662164bcb7a');
	  gr.query();
	  if(gr.next()){
		gr.deleteRecord(); 
	  } 
	  }
	})(inputs, outputs);
//
//
	
// update kba valid to date using staging table from excel file
//u_kb_review_dates_fix - staging table name

var gr = new GlideRecord("u_kb_review_dates_fix");
//gr.setLimit(1);
gr.query();
while (gr.next()) {
    var kb = new GlideRecord("kb_knowledge");
    kb.addEncodedQuery("workflow_state=published^u_correlation_id!=NULL^u_correlation_id=" + gr.u_aritcle_id);
    kb.query();
    if (kb.next()) {
        gs.print("lets update " + kb.number + " with " + gr.u_next_review_date)  ;		
        kb.valid_to = gr.u_next_review_date;
        kb.setWorkflow(false);

        kb.update();
    }

}//
//


// check cmdb for cis, check for label and label entries,
// create label entries where needed

var cip = new GlideRecord('cmdb_ci_peripheral');
var labelEntry = new GlideRecord("label_entry");
var label = new GlideRecord('label');
cip.addEncodedQuery('u_tier_3STARTSWITHkvm');
//cip.setLimit(1);
cip.query();
while (cip.next()) {
	//gs.info('BM: Found cip: ' + cip.name);
	label.addEncodedQuery('nameSTARTSWITHkvm switch');
	label.query();
	if (label.next()) {
        labelEntry.addEncodedQuery("label=" + label.sys_id + "^table_key=" + cip.sys_id);
        labelEntry.query();
        if (!labelEntry.next()) {
            labelEntry.initialize();
            labelEntry.title = label.name + " - " + cip.name;
            labelEntry.label = label.sys_id;
            labelEntry.table = "cmdb_ci";
            labelEntry.table_key = cip.sys_id;
            labelEntry.url = "cmdb_ci.do?sys_id=" + cip.sys_id + "&sysparm_view=";
            labelEntry.insert();

        }
	}
}	

//
//


// email notification script with styling

(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
	/* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
	/* Optional GlideRecord */ event) {
var i18nSummary = gs.getMessage('Summary details');
var i18nResolvedBy = gs.getMessage('Resolved by: {0}', '${resolved_by}');
var autoCloseMsg = "Your incident will automatically close in " + gs.getProperty('glide.ui.autoclose.time') + " days";
var i18nClosedNotes = gs.getMessage('Resolved notes: {0}', '${close_notes}');
template.print('<p><font size="4" color="#808080" face="helvetica"><strong>' + i18nSummary + '</strong></font></p>');
template.print('<p><font size="3" color="#808080" face="helvetica">' + i18nResolvedBy + '</font></p>');
template.print('<p><font size="3" color="#808080" face="helvetica">' + i18nClosedNotes + '</font></p>');
template.print('<p><font size="3" color="#808080" face="helvetica">' + autoCloseMsg + '</font></p>');
})(current, template, email, email_action, event);

//

// check flows for tasks assigned to a HP group

var flowList = [];

var gr = new GlideRecord('sys_hub_action_instance');

gr.query();

while(gr.next()){

    var flowName = ''+ gr.flow.getDisplayValue();

    if(gr.action_inputs.var__m_sys_hub_action_input_af51fd0e73141300612c273ffff6a785.ah_fields.indexOf('assignment_group={"display":"HP')>-1 && flowList.indexOf(flowName) ==-1){

        gs.print(gr.action_inputs.var__m_sys_hub_action_input_af51fd0e73141300612c273ffff6a785.ah_fields);

        flowList.push(flowName);

    }

}

gs.print(flowList);

//

// add a new sc_tasks to items without it 

var grItem = new GlideRecord('sc_req_item');
grItem.addEncodedQuery('numberINRITM0023987,RITM0023985,RITM0023984,RITM0023983,
RITM0023982,RITM0023981,RITM0023980,RITM0023979,RITM0023978,
RITM0023976,RITM0023975,RITM0023972,RITM0023970,RITM0023969,
RITM0023968,RITM0023967,RITM0023966,RITM0023952,RITM0023950,RITM0023939,
RITM0023926,RITM0023925,RITM0023923,RITM0023557,RITM0023556,RITM0023555,
RITM0023544,RITM0023541,RITM0023540,RITM0023539,RITM0023538,RITM0023535,
RITM0023534,RITM0023533,RITM0023517,RITM0023137,RITM0023136,RITM0023135,
RITM0023132,RITM0023131,RITM0023130,RITM0023129,RITM0023128,RITM0023127,
RITM0023126,RITM0023124,RITM0023122,RITM0023121,RITM0023120,RITM0023119,RITM0023118,RITM0023117,RITM0023116,RITM0023115,RITM0023111,
RITM0023108,RITM0023106,RITM0023099,RITM0023098,RITM0023097,RITM0023094,RITM0023093,RITM0023091,RITM0023088,RITM0022639,RITM0022637,
RITM0022636,RITM0022635,RITM0022631,RITM0022629,
RITM0022628,RITM0022626,RITM0022624,RITM0022621,RITM0022618,RITM0022615,RITM0022606,RITM0022604,RITM0022602,RITM0022601,RITM0022598,
RITM0022588,RITM0022587,RITM0022584,RITM0022576');

grItem.query();

while(grItem.next()) {
	grItem.setValue('stage', 'fulfillment');
	grItem.update();
	var task = new GlideRecord('sc_task');
	task.initialize();
	task.assignment_group = 'f88c696bdb4bb8100d6eebca139619e7'; // CG-SI-US-Service Desk-Tier2 sys_id
	task.short_description = 'Shared Folder  - Add Access (US)';
	task.request_item = grItem.sys_id;
	task.insert();
}
//

// ref attribute
ref_auto_completer=AJAXTableCompleter,ref_ac_columns=code;name,ref_ac_columns_search=true

//

//Script to not attach an email attachment with the same name
var grAtt = new GlideRecord('sys_attachment');
grAtt.addQuery('hash', current.hash);
grAtt.addQuery('table_sys_id', current.table_sys_id);
grAtt.addQuery('table_name', current.table_name);
grAtt.query();



if (grAtt.hasNext()) {
gs.addErrorMessage('ABORT: found the same attachment');
current.setAbortAction(true);

//

//A fix script was created to delete small attachments 
var gr = new GlideRecord("sys_attachment");
gr.addQuery("table_name", "IN" ,"incident,u_incident,u_request");
gr.query();
while(gr.next()) {
if(parseInt(gr.size_bytes) < 15000)
gr.deleteRecord();
}
//

// BR to check for vendors on the group if multiple select the first one

(function executeRule(current, previous /*null when async*/ ) {

    var vendors = current.assignment_group.vendors;
    var vendArr;
    var vendReq;

    if (vendors) {
        if (vendors.indexOf(",") > 0) {
            vendArr = vendors.split(",");
            vendReq = vendArr[0];
        }else{
			vendReq = vendors;
		}
       current.u_vendor = vendReq;
    }
})(current, previous);

//

// change emails domain for user from a certain group

getMembers();

function getMembers() {
    var userGr = new GlideRecord('sys_user_grmember');
    userGr.addQuery('group.name', 'Capacity Mgmt');
    userGr.query();
    while (userGr.next()) {
        var userEmail = userGr.user.email.toString();
        if(userEmail.indexOf('@example.com') > -1){
            var userRec = userGr.user.getRefRecord();
			gs.info('UserRec.email ' + userRec.email);
            var name = userEmail.substring(0, userEmail.indexOf('@'));    
            userRec.email = name + '@newemail.com';    
            userRec.setWorkflow(false);
            userRec.update();
        }
    }
}

//

//Recursion function

function countdown(n) {
  if (n < 1) {
    return [];
  } else {
    let myArray = countdown(n-1);
    myArray.unshift(n);
    return myArray;
  }
}

//

// Add new fields to already open ritms

var var1 = ["b8d91ccc1bbac510af4184c0f54bcbe6", "3000"];
var var2 = ["3d685c0c1bbac510af4184c0f54bcb60", "3010"];
var var3 = ["3e881c0c1bbac510af4184c0f54bcba0", "3020"];
var var4 = ["740a9c8c1bbac510af4184c0f54bcb5c", "3030"];


var ritm = new GlideRecord("sc_req_item");
ritm.addEncodedQuery("numberINRITM0010161,RITM0010290,RITM0011254,RITM0011544,RITM0011889,RITM0012045,RITM0012048,RITM0012292,RITM0012398,RITM0012447,RITM0012609,RITM0012693,RITM0012841,RITM0012867,RITM0012946,RITM0013149,RITM0013156,RITM0013159,RITM0013160,RITM0013182,RITM0013188,RITM0013194,RITM0013506,RITM0013731,RITM0013140,RITM0013958,RITM0014041,RITM0014054,RITM0014475,RITM0014803,RITM0014915,RITM0013148,RITM0015007,RITM0011511,RITM0015514,RITM0016082,RITM0016438,RITM0016888,RITM0017314,RITM0018076,RITM0018558,RITM0018635,RITM0014877,RITM0018920,RITM0019289,RITM0019233,RITM0019624,RITM0019973,RITM0012069,RITM0011642,RITM0020402,RITM0021012,RITM0021103,RITM0021091,RITM0021452,RITM0021394,RITM0021801,RITM0022097,RITM0022196,RITM0022288,RITM0013147,RITM0024576,RITM0025386,RITM0025592,RITM0025191,RITM0025307,RITM0021670,RITM0012293,RITM0025934,RITM0026042,RITM0025256,RITM0023770,RITM0012238,RITM0026997,RITM0010534,RITM0012233,RITM0027047,RITM0027139,RITM0023655,RITM0014291,RITM0014683,RITM0023030,RITM0024503,RITM0024066,RITM0023311,RITM0018471,RITM0019695,RITM0028014,RITM0028060,RITM0028063,RITM0028147,RITM0028463,RITM0027941,RITM0028591,RITM0015565,RITM0029224,RITM0019268,RITM0028361,RITM0029609,RITM0029844,RITM0030632,RITM0030727,RITM0029732,RITM0031241,RITM0021213,RITM0031300,RITM0021882,RITM0026052,RITM0026686,RITM0031993,RITM0032014,RITM0031533,RITM0032270,RITM0032396,RITM0031811,RITM0032591,RITM0032609,RITM0032803,RITM0033087,RITM0033122,RITM0026836,RITM0033232,RITM0033345,RITM0010580,RITM0033584,RITM0013200,RITM0033220,RITM0028693,RITM0033457,RITM0033781,RITM0033186,RITM0033934,RITM0033946,RITM0034278,RITM0034287,RITM0034376,RITM0034404,RITM0012181,RITM0034470,RITM0032828,RITM0034637,RITM0034776,RITM0034908,RITM0035019,RITM0035280,RITM0013168,RITM0035390,RITM0025385,RITM0035701,RITM0035815,RITM0013154,RITM0035931,RITM0035958,RITM0035521,RITM0036075,RITM0036087,RITM0011893,RITM0036344,RITM0036580,RITM0036608,RITM0036747,RITM0037042,RITM0036986,RITM0037408,RITM0037411,RITM0037429,RITM0037431,RITM0037470,RITM0037542,RITM0035185,RITM0031013,RITM0037651,RITM0014698,RITM0037155,RITM0017966,RITM0037903,RITM0014879,RITM0012087,RITM0034064,RITM0037821,RITM0012424,RITM0038399,RITM0038459,RITM0038479,RITM0038538,RITM0038013,RITM0038614,RITM0038697,RITM0025327,RITM0039034,RITM0037826,RITM0038371,RITM0039074,RITM0029926,RITM0039248,RITM0027918,RITM0039330,RITM0039292,RITM0039571,RITM0039621,RITM0039600,RITM0039609,RITM0039793,RITM0039995,RITM0040168,RITM0040287,RITM0040353,RITM0040419,RITM0040531,RITM0012502,RITM0040589,RITM0040709,RITM0040823,RITM0040381,RITM0039425,RITM0040453,RITM0041404,RITM0041431,RITM0041539,RITM0041322,RITM0041579,RITM0027338,RITM0027247,RITM0041538,RITM0041622,RITM0041541,RITM0041362,RITM0041543,RITM0041476,RITM0041873,RITM0042171,RITM0036192,RITM0040895,RITM0041055,RITM0015066,RITM0042215,RITM0037758,RITM0036643,RITM0042381,RITM0042282,RITM0042360,RITM0041775,RITM0042593,RITM0042749,RITM0041741,RITM0042673,RITM0042895,RITM0042951,RITM0043000,RITM0038477,RITM0043148,RITM0043175,RITM0012171,RITM0043369,RITM0043118,RITM0043516,RITM0043520,RITM0043559,RITM0043632,RITM0043916,RITM0043932,RITM0044072,RITM0043923,RITM0044226,RITM0044435,RITM0044442,RITM0044455,RITM0044540,RITM0044674,RITM0044800,RITM0044799,RITM0043760,RITM0043761,RITM0043819,RITM0042378,RITM0044270,RITM0044016,RITM0045151,RITM0045222,RITM0045291,RITM0045305,RITM0045306,RITM0045315,RITM0045330,RITM0044940,RITM0045241,RITM0045379,RITM0045325,RITM0045285,RITM0045424,RITM0045272,RITM0045442,RITM0045463,RITM0040841");
//ritm.addEncodedQuery("numberINRITM0010161,RITM0010290");
ritm.query();
while(ritm.next()) {
	var ItemOption1  = CreateItemOption(var1);
	var ItemOption2  = CreateItemOption(var2);
	var ItemOption3  = CreateItemOption(var3);
	var ItemOption4  = CreateItemOption(var4);
	
	Createscitemoptionmtom(ritm.getValue("sys_id") ,ItemOption1 );
	Createscitemoptionmtom(ritm.getValue("sys_id") ,ItemOption2 );
	Createscitemoptionmtom(ritm.getValue("sys_id") ,ItemOption3 );
	Createscitemoptionmtom(ritm.getValue("sys_id") ,ItemOption4 );
	
	
}


function CreateItemOption(vararray) {
    var gr = new GlideRecord("sc_item_option");
    gr.initialize();
    gr.item_option_new = vararray[0];
	gr.order = vararray[1];
	return gr.insert();

}

function Createscitemoptionmtom(REQITEM, ItemOption){
	var mtom = new GlideRecord("sc_item_option_mtom");
	mtom.initialize();
	mtom.request_item = REQITEM;
	mtom.sc_item_option = ItemOption;
	mtom.insert();
}



// Tranform catalogue categories to tree picker for NOW Experience framework component

/*Properties :

[{
  "name": "data",
  "label": "data",
  "readOnly": "false",
  "fieldType": "json",
  "valueType": "object",
  "mandatory": "true"
}]
*/

function transform(input) {
  var retArr = [];
  var records = input.data;
var finalResult = [];

  for (var i in records) {
      var myObj = {};
      myObj.label = records[i].title.displayValue;
      myObj.id = records[i].parent.displayValue;
      retArr.push(myObj);
  }

  for (var j in retArr) {
      
      if (retArr[j].id === '') {
    var parObj = {};
    parObj.id = retArr[j].label;
    parObj.label = retArr[j].label;
    parObj.children = [];
          finalResult.push(parObj);
      }
  
  }
for (z in retArr) {
  
  if(retArr[z].id !=''){
    var childObj = {};
    childObj.id = retArr[z].label;
    childObj.label = retArr[z].label;
    for(x in finalResult) {
      if (finalResult[x].id == retArr[z].id) {
        finalResult[x].children.push(childObj);
        }
    }
  }
  
  
}

  return finalResult;
}



//TeamConnect glide list check values from payload if existing in the system 
//if yes push to the array if not worknote them

var impactedLocations = source.impacted_locations;
var locations = 'cmn_location';
gs.info('BM bc is ' + bindingCache['impacted_locations']);

if (bindingCache['impacted_locations'] != impactedLocations) {
    //glide list has changed
	BindingUpdates['impacted_locations'] = impactedLocations;
	
    var validLocations = [];
    var invalidLocations = [];

    if (impactedLocations.length) {
        for (var x = 0; x < impactedLocations.length; x++) {
            var gqLocation = new global.GlideQuery(locations)
                .where('name', impactedLocations[x]);
            var count = gqLocation.count();
            if (count == 1) {
                var loc = gqLocation
                    .selectOne()
                    .get();
                validLocations.push(loc.sys_id);
            } else {
                invalidLocations.push(impactedLocations[x]);
            }
        }
    }

    if (invalidLocations.length) {
        //         JournalEntries = {
        //             work_notes: 'Invalid locations: ' + invalidLocations
        //         };
        var text = 'Invalid locations: ' + invalidLocations;
        TranslatedValues.dxc_notes = payload.dxc_notes ? payload.dxc_notes + '\n\n' + text : text;
    }
	
	
		if (validLocations.length) {
			answer = validLocations;
		} else {
			if (source.type === 'Standard') {
				answer = ['18acc7041b191510af4184c0f54bcb92']; //DXC Default location
			} else {
				answer = undefined;
			}
		}    
}

//

// get previous field value in integrated field

var element = { previousGroup : '' };

if (!field.nil()) {
	element.previousGroup = (previousField.name + '') ? previousField.name + '' : field.name + '';
  answer = element;
};



var element = {oldSiteID : '',
			   oldSiteName : '',
			   street : '',
			   city : '',
			   state : '',
			   zip : '',
			   country : ''};

if (!previousField.sys_id.nil()) {
	element.oldSiteID = previousField.sys_id + '';
	element.oldSiteName = previousField.name + '';
}
if (!field.nil()) {
	element.street = field.street + '';
	element.city = field.city + '';
	element.state = field.state + '';
	element.zip = field.zip + '';
	element.country = field.country + '';
}
answer = element;
//



// GlideQuery example 
var cmdb = 'cmdb_ci';
var ciName = source.cmdb_ci;

var cmdbGq = new global.GlideQuery(cmdb)
  .where('name', ciName);
var count = cmdbGq.count();

if (count === 1) {
  var ci = cmdbGq
    .selectOne()
    .get();
  answer = ci.sys_id;
} else {
  var text = ciName + ' could not be found.';
  var dxc_notes = payload.dxc_notes || [];
  dxc_notes.push(text);
  TranslatedValues.dxc_notes = dxc_notes;
  answer = undefined;
}

// checking if sys_id is a valid record
let fieldValue = sys_id;

if (fieldValue) {
  grAsset = new GlideRecord('alm_hardware');
  grAsset.get(fieldValue);
  if (grAsset.isValidRecord()) {
      return fieldValue;
  }
}

//

//TeamConnect  - inbound translation - find asset, check if it is valid record and present in the payload, 
//find asset_model from the payload update asset with it if it is different

(function() {
  var grAsset;
  if (payload.asset) {
      grAsset = new GlideRecord('alm_hardware');
      grAsset.get(payload.asset);
  } else if (actionType === 'update') {
      grAsset = target.asset;
      if (!grAsset.isValidRecord())
          return;
  } else {
      return;
  }
  var grAssetModel = findAssetModel();
  if (grAsset.getValue('asset_model') == grAssetModel.getValue('sys_id')) {
      return undefined;
  }
  grAsset.asset_model = grAssetModel.sys_id;
  grAsset.update();
  return undefined;




function findAssetModel() {

var grModel;

if (field.value) {
      grModel = new GlideRecord('cmdb_hardware_product_model');
      grModel.get(field.value);
      if (grModel.isValidRecord())
          return field.value;
  }

  if (field.ref_value && field.ref_value.sap_material_number) {
      grModel = new GlideRecord('cmdb_hardware_product_model');
      grModel.addQuery('u_sap_material_number', field.ref_value.sap_material_number);
      grModel.query();
      if (grModel.next()) {
          return grModel.getValue('sys_id');
      }
  }

  if (field.ref_value && field.ref_value.model_number) {
      grModel = new GlideRecord('cmdb_hardware_product_model');
      grModel.addQuery('model_number', field.ref_value.model_number);
      grModel.query();
      if (grModel.next()) {
          return grModel.getValue('sys_id');
      }
  }

if (field.ref_value && field.ref_value.name) {
      grModel = new GlideRecord('cmdb_hardware_product_model');
      grModel.addQuery('name', field.ref_value.name);
      grModel.query();
      if (grModel.next()) {
          return grModel.getValue('sys_id');
      }
  }

return undefined;
}

})();

//


// Create a child task from flow using custom action in flow designer

(function execute(inputs, outputs) {
  
  //check the provided parent template to see if it has any child templates and if there are child templates, proceed with creating a task and apply the child template to it. The parentField varialbe is the field that relates the child task to the parent.
  	var parentField = inputs.parentFieldName.toString();
    var grTemplate = new GlideRecord('sys_template');
    grTemplate.get(inputs.templateSysID);
    if (grTemplate.next_child) {
        var grTask = new GlideRecord(grTemplate.next_child.table);
        grTask.initialize();
        grTask.applyTemplate(grTemplate.next_child.name);
		grTask[parentField] = inputs.parentTaskSysID;
        grTask.insert();
      
      //check if the child template has a "next related template" and create a task for it to be applied to and repeat for the next related template until the last template no longer has a next template
        var nexttemplate = grTemplate.next_child.next;
        if (nexttemplate) {
			while (nexttemplate != ""){
			    grTask.initialize();
            	grTask.applyTemplate(nexttemplate.name);
				grTask[parentField] = inputs.parentTaskSysID;
            	grTask.insert();
            nexttemplate = nexttemplate.next;				
			}
        }
    }
  
})(inputs, outputs);

///


// UI Action to find Synch Rule templates and create new records for them for a new integrated system

var specificId = current.sys_id + '';
var company = current.company.name;
var messages = [];
var companyCondition = '^company=' + current.company.sys_id;
var text = 'Opened from ';

var sr = new GlideRecord('x_mukl_tc_synch_rule');
sr.addEncodedQuery('active=' + true + '^u_template=' + true);
sr.query();
if (sr.getRowCount()) {
    while (sr.next()) {
        var csr = new GlideRecord('x_mukl_tc_synch_rule');
        csr.addEncodedQuery('active=true^specificIN' + specificId + '^entity=' + sr.entity);
        csr.setLimit(1);
        csr.query();
        if (csr.next()) {
            PopulateGRValues(csr, sr);
            csr.update();
            messages.push('Sync Rule for ' + company + ' for entity ' + sr.entity.name + ' already exists. <a href="' + csr.getLink() + '">' + csr.getDisplayValue() + '</a>');
        } else {
            csr.newRecord();
            PopulateGRValues(csr, sr);
            csr.insert();
            messages.push('Sync Rule for ' + company + ' for entity ' + sr.entity.name + ' inserted. <a href="' + csr.getLink() + '">' + csr.getDisplayValue() + '</a>');
        }

    }
    for (i = 0; i < messages.length; i++) {
        gs.addInfoMessage(messages[i]);
    }
}else {
	gs.addInfoMessage('No Active Templates Found');
}

action.setRedirectURL(current);


function PopulateGRValues(csr, sr) {
    csr.specific = specificId;
    csr.entity = sr.getValue('entity');
    csr.condition = sr.getValue('condition') + companyCondition;
    csr.table = sr.getValue('table');
    csr.description = text + sr.getValue('description') + ' for: ' + company;
    csr.active = true;
    csr.u_template = false;
}

//
