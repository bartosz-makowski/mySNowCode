/* TC STORE APP  */


// Integrated field for field request_item in TC Core store app - IBSH project

var element = {
	variable_names: [], request : '', variable_answers: []
};

if (!field.nil()) {
	element.request = field.request.number + '';
	//RequestedFor details
    element.requested_for = field.requested_for + '';
	element.firstName = field.requested_for.first_name + '';
	element.lastName = field.requested_for.last_name + '';
	element.userName = field.requested_for.user_name +'';
	element.emailAddress = field.requested_for.email +'';
	element.phone = field.requested_for.phone + '';
	element.mobile_phone = field.requested_for.mobile_phone + '';
	// location details
	element.location = field.requested_for.location.name + '';
	
	element.req_code = field.variables.request_type_code +'';
	element.varPhone = field.variables.phone + '';
	element.varSite = field.variables.delivery_address.name + '';
	

    // part of the script to get question answers from mulitple row variables 

	var grItemOptionMtom = new GlideRecord('sc_item_option_mtom');
    grItemOptionMtom.addQuery('request_item', field.sys_id);
    grItemOptionMtom.orderBy('sc_item_option.order');
    grItemOptionMtom.query();

    while (grItemOptionMtom.next()) {
        var variableName = grItemOptionMtom.sc_item_option.item_option_new.name.toString();
		var variableAnswer = grItemOptionMtom.sc_item_option.value.toString();
		// is it on a multi row variable set?
		var mrvsAnswer = grItemOptionMtom.sc_item_option.item_option_new.variable_set.type == 'one_to_many' ? true : false;
		if (mrvsAnswer) {
			var mrvsAns = '';
			grMrvsAnswers = new GlideRecord('sc_multi_row_question_answer');
			grMrvsAnswers.addQuery('sc_item_option',grItemOptionMtom.sc_item_option);
			grMrvsAnswers.query();
			while (grMrvsAnswers.next()) {
				mrvsAns = mrvsAns == '' ? grMrvsAnswers.value.toString() : mrvsAns + ' ' + grMrvsAnswers.value.toString();
			}
			variableAnswer = mrvsAns;
		}
		element.variable_answers.push(variableAnswer);
        element.variable_names.push(variableName);
    }
}
answer = element;




// Translation script to compose SOAP Questions>question structure in TC Core store app - IBSH Project
// added to request_item integrated field
(function() {
    var arr = {};

    var sctaskVariables = JSON.parse(record.variables.value); // variables integrated field on sc_task

    var recordVariables = field.variable_names; // taken off from integrated field on requested_item field
	var questionAnswers = '[';

    if (sctaskVariables.length > 0) {
        for (i = 0; i < recordVariables.length; i++) {
            var varName = recordVariables[i];

            var sctaskVariablesIndex = (i * 2) + 1;
            var value = sctaskVariables[sctaskVariablesIndex];

            var test = varName + ',' + value + ',' + field.variable_answers[i];
            var useMvrs = value ? false : true;
            if (value == '' && field.variable_answers[i]) {
                value = field.variable_answers[i];
            }

            if (value !== '') {
                if (varName == 'requested_for') {
                    var userGR = new GlideRecord('sys_user');
                    userGR.get(value);
                    var userName = userGR.getDisplayValue('user_name');
                    var reqForObj = {

                        _attributes: ["defID", "questionLabel", "questionSequence", "Answer"],
                        "@defID": varName,
                        "@questionLabel": varName,
                        "@questionSequence": 101 + i,
                        "@Answer": userName

                    };
                   // arr.push(reqForObj);
                   arr[varName] = userName;
					questionAnswers = questionAnswers == '[' ? questionAnswers + '\"' + varName + '\",\"' + userName + '\"' : questionAnswers + ',\"' + varName + '\",\"' + userName + '\"';

                } else {
                    var obj = {
                       
                        _attributes: ["defID", "questionLabel", "questionSequence", "Answer"],
                        "@defID": varName,
                        "@questionLabel": varName,
                        "@questionSequence": 101 + i,
                        "@Answer": value

                    };
                    //arr.push(obj);
                    arr[varName] = value;
					questionAnswers = questionAnswers == '[' ? questionAnswers + '\"' + varName + '\",\"' + value + '\"' : questionAnswers + ',\"' + varName + '\",\"' + value + '\"';
                }
            }
        }
    }
	questionAnswers = questionAnswers + ']'; // add closing bracket
	questionAnswers = questionAnswers.replace(/(?:\r\n|\r|\n)/g, '\\r\\n'); // remove the line breaks
  //  return arr;


	
	return {handling:["variables"],
		  Display: ["Additional software requirements","Optional Items"],
		  Quantity:["Number", "Quantity", "QTY"], 
		  TranslateBoolean : ["Yes","No"],
		  ID: field.req_code,
		  _text: questionAnswers};
	
	
})();


// translation to get transcript of variables and push it into details element in SOAP message if more than 4000 characters it gets sent as attachment - IBSH project

(function() {
    var actionRecordVars = JSON.parse(record.variables.value);

    var transcript = '';

    if (actionRecordVars.length > 0) {
        var variableNames = record.request_item.variable_names;

        for (i = 0; i < variableNames.length; i++) {
            var varName = variableNames[i];

            var sctaskVariablesIndex = (i * 2) + 1;
            var value = actionRecordVars[sctaskVariablesIndex];

            if (value !== '') {
                transcript = transcript + varName + ' : ' + value + '\n';
            }
        }
    }

    answer = {
        handling :["textattachment"],
		size: 4000,
		text: 'Text truncated, see attachment',
		filename: 'full_description',
		forced : false,
		preamble:'Text truncated, see attachment.\n',
		preambleOnly: false
    };

    return answer;
})();



// External reference needed within header element - translation added to Number integrated field
// Transmitted attribute name ExternalReferences
(function() {

    var element = {
        _children: ['ExternalReference'],
        _arrays: {
            ExternalReference: true
        },
        ExternalReference: [{
                _attributes: ['name'],
                '@name': 'Request',
                _text: record.request_item.request
            },
            {
                _attributes: ['name'],
                '@name': 'Request Item',
                _text: record.request_item.displayValue.number
            }
        ]
    };
    return element;
})();


// Opened by integrated field

var element = {};

if(!field.nil()) {
	element.uniqueID = field.user_name + '';
	element.firstName = field.first_name + '';
	element.lastName = field.last_name + '';
	element.emailAddress = field.email + '';
	element.phone = field.phone + '';
	element.mobilePhone = field.mobile_phone + '';
}
answer = element;

// Translation for rRequestedBy

(function() {

    var site = record.request_item.varSite; // variable delivery_address taken from request_item record cache  
    var phone = field.phone;

    if (!site) {
        site = 'No delivery address selected';
    }

    if (!phone) {
        phone = field.mobile_phone;
    }

    var element = {
        "handling": ["user"],
        _attributes: ["type", "company", "uniqueID"],
        _children: ["FirstName", "LastName", "EmailAddress", "PhoneNumber", "Site"],
		"@type":'RequestedBy',
        "@company": systemCache['@mainCompany'],
        "@uniqueID": field.uniqueID,
        FirstName: {
            _text: field.firstName
        },
        LastName: {
            _text: field.lastName
        },
        EmailAddress: {
            _text: field.emailAddress
        },
        PhoneNumber: {
            _text: phone
        },
        Site: {
            _attributes: ["siteName"],
            "@siteName": site
        }
    };

    return element;
})();

//
