function ceil100(number){
	return Math.ceil(number/100)*100;
}
function format(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function reload(){
	location.reload();
}
function reload_page(url){
	var current_page = window.location.href;
	if(current_page.indexOf(url) > -1){
		reload();
	}
}
function init_redactor(selector){
	$(selector).redactor({
		focus: true,
		minHeight: 150
		//,plugins: ['fontcolor']
	});
}
function show_loading(loading_text){
	loading_text = loading_text || lang.loading;
	$('#loading_text').html(loading_text);
	$('#backdrop').show();
	$('#loading_container').show();
}
function hide_loading(){
	$('#backdrop').hide();
	$('#loading_container').hide();
}
function disable(selector){
	$(selector).addClass('disabled').attr('disabled', 'disabled');		
}
function enable(selector){
	$(selector).removeClass('disabled').removeAttr('disabled');		
}

function formatButton(){
    $('.ui-dialog-buttonpane').find('button:contains("OK")').addClass('btn btn-primary btn-small right5');
    $('.ui-dialog-buttonpane').find('button:contains("Close")').addClass('btn btn-primary btn-small right5');
    $('.ui-dialog-buttonpane').find('button:contains("Cancel")').addClass('btn btn-small right5');
}
function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        //x1 = x1.replace(rgx, '$1' + ',' + '$2');
		x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2;
}
function active_column(sort_direction, sort_index){
	$('#' + sort_direction + sort_index).addClass('active');	
}
function closeDialog(dialog_id){
	$('#' + dialog_id).dialog("close");
}
function change_page(page, fun){
	page = page || 1;
	$('#page').val(page);
	fun = fun || showGrid;
	fun();
}
function change_pagesize(page_size, fun){
	page_size = page_size || 10;
	$('#page_size').val(page_size);
	fun = fun || showGrid;
	fun();
}
function change_sort_index(sort_index, fun){
	sort_index = sort_index || 1;
	$('#sort_index').val(sort_index);
	fun = fun || showGrid;
	fun();
}
function change_sort_direction(sort_direction, fun){
	sort_direction = sort_direction || 'DESC';
	$('#sort_direction').val(sort_direction);
	fun = fun || showGrid;
	fun();
}
function sort(element, index, fun){
	var direction = $('#sort_direction').val();	
	if(direction == 'DESC'){
		$('#sort_direction').val('ASC');
		$('#sort_index').val(index);
	}else{
		$('#sort_direction').val('DESC');	
		$('#sort_index').val(index);
	}
	fun = fun || showGrid;
	fun();
}
function desc(index, fun){
	$('#sort_direction').val('DESC');
	$('#sort_index').val(index);
	$('.desc').css('display', 'none');
	$('#desc'+index).addClass('display', 'inline');
	fun = fun || showGrid;
	fun();
}
function asc(index, fun){
	$('#sort_direction').val('ASC');
	$('#sort_index').val(index);
	$('.asc').css('display', 'none');
	$('#asc'+index).css('display', 'inline');
	fun = fun || showGrid;
	fun();
}
function active_column(sort_direction, sort_index){
	$('#' + sort_direction.toLowerCase() + sort_index).css('display', 'inline');	
}
function checkall(element){
	$('input:checkbox').prop('checked', element.checked);  
}
function getCheckedData(){	 
	var str = '';
	$('input.citem:checkbox:checked').each(function(){
		var data = $(this).attr('data');
		if(str != '')
			str = str + ',';
		str = str + data;
	});
	return str;
}
function goto_url(url){	
	if(g_account_id > 0){
		if(url.indexOf(".php?") > 0){ // has ? before
			if(url.indexOf('&a=') == -1) // add brand param if not exists before
				url = url + '&a=' + g_account_id;
		}
		else{
			url = url + '?a=' + g_account_id;
		}
	}
	window.location = url;		
}	
	
function goto(url){
	window.location = url;
}
function resize_iframe(){
	var the_height = document.getElementById('iframe').contentWindow.document.body.scrollHeight;
	//change the height of the iframe
	document.getElementById('iframe').height =  the_height;
}
function showError(mess, functionOnOk){
	showAlert('<span style="color:red"><i class="glyphicon glyphicon-exclamation-sign"></i> ' + lang.error + '!</span>', mess, functionOnOk);
}
function showWarning(mess, functionOnOk){
	showAlert('<span style="color:#e7b73d"><i class="glyphicon glyphicon-warning-sign"></i> ' + lang.warning + '!</span>', mess, functionOnOk);
}
function showSuccess(mess, functionOnOk){
	showAlert('<span style="color:green"><i class="glyphicon glyphicon-thumbs-up"></i> ' + lang.success + '!</span>', mess, functionOnOk);
}
function showNotice(mess, functionOnOk){
	showAlert('<span style="color:#e7b73d"><i class="glyphicon glyphicon-question-sign"></i> ' + lang.notice + '!</span>', mess, functionOnOk);
}
function format_message(message){
	message = message.replace(/<red>/g, '<span style="color:red;font-weight:bold;">');	
	message = message.replace(/<green>/g, '<span style="color:green;font-weight:bold;">');	
	message = message.replace(/<\/red>/g, '</span>');
	message = message.replace(/<\/green>/g, '</span>');
	return message;
}
function showAlert(title, descrip, functionOnOk){
	$('#alert-dialog').portalDialogue({
		title : title,
		confirm: true, 
		description: descrip,
		action: '#'
	}, function(){ 
		hide_backdrop();
		if(functionOnOk != null && functionOnOk != undefined)
			functionOnOk();
	});
	$('#alert-dialog').find('.modal-title').html(title); 
	$('#alert-dialog').find('.modal-body').html(format_message(descrip));
}
// confirm dialog which require user enter text like = "OK" to agree with danger notice
function showConfirmStrict(header, description, functionOnOk, functionOnCancel){
	showConfirm(header, description, functionOnOk, functionOnCancel, true);
}
function showConfirm(header, descrip, functionOnOK, functionOnCancel, restrict_label){
	$dialog = $('#confirm-dialog');
	$dialog.find('.restrict').hide();
	restrict_label = restrict_label | false;
	$dialog.portalDialogue({
		title : header,
		confirm: true,
		btnClose : 'Cancel',
		btnConfirm : 'OK',		
		action: '#'
	}, function(){
		if(restrict_label){
			$dialog.find('.form').validator();
			if($dialog.find('.form').validator('check') >= 1)
				return false;
		}			
		functionOnOK(); 
		return true;
	}, function(){
		if(functionOnCancel != null && functionOnCancel != undefined)
			functionOnCancel();
	});
	$dialog.find('.modal-title').html('<span style="color:red;font-weight:bold;">' + header + '</span>');
	$dialog.find('.modal-description').html(format_message(descrip));
	$dialog.find('.cancel').html("Cancel").removeAttr('type');
	$dialog.find('.confirm').html("OK").removeAttr('type');
	if(restrict_label){
		$dialog.find('.restrict').show();
		$dialog.find('.restrict input').val('').show();	
	}		
}

function showCustomDialogStrict(dtitle, dialogId, functionOnOK, functionValidate, dwidth){
	showCustomDialog(dtitle, dialogId, functionOnOK, functionValidate, dwidth, true);
}
function showCustomDialog(dtitle, dialogId, functionOnOK, functionValidate, dwidth, restrict_label){
	$dialog = $("#" + dialogId);
	restrict_label = restrict_label || false;
	$dialog.portalDialogue({
		confirm: true,
		//width: dwidth,
		title: dtitle,
		btnClose : lang.cancel,
		btnConfirm : lang.ok,
		action: '#'
	}, function(){ 
		if(functionValidate != null){ // neu co ham validate
			if(!functionValidate.call()) // neu validte khong thanh cong -> quay tro ve
			return false;
		}
		if(restrict_label){
			$dialog.find('.modal-body').validator();
			if($dialog.find('.modal-body').validator('check') >= 1)
				return false;
		}
		functionOnOK();
		return true;
	}, function(){
		window.writeln('test');
		if(functionOnCancel != null && functionOnCancel != undefined)
			functionOnCancel();
		//$(this).dialog("close");
	});
	if(restrict_label){
		$dialog.find('.modal-body').find('#restrict').remove();
		$dialog.find('.modal-body').append('<div class="form-group" id="restrict" style="clear:both">' + 
												'<div style="display: block; margin-top: 20px; clear: both; height: 33px;" class="restrict">' +
													'<input type="text" class="form-control txtAgree" required regex="[oO][kK]" placeholder="OK" style="width: 80px; display: block; float: left; margin-top: 0px;" ' + 
														'data-validation-regex-regex="OK" data-validation-regex-message="Must enter OK to confirm this action" />' +
													'<p style="float: left; margin-top: 10px; margin-left: 10px;" class="">Type OK to process</p>' +
													'<p class="help-block"></p>' + 
												'</div>' +
											'</div>');
	}
}
 
function hide_backdrop(){
	$('#backdrop').hide();
}
$(function(){
	$(document).on('keydown', function(evt) {
        if (evt.keyCode === 27){ //$.ui.keyCode.ESCAPE) {			
            hide_backdrop();
            if($(".ui-dialog-content").length > 0)
				$(".ui-dialog-content").dialog("close");
        }
    });
	
	/*$('.menu-trigger').hover(function(){
		$('.dropdown-menu-absolute').fadeIn(300);
	},function(){
		$('.dropdown-menu-absolute').fadeOut(300);
	});*/
		
	$('.tabs .tabs-item').each(function(){
		$(this).unbind('click').bind('click', function(){
			var tab_content = $(this).find('a').attr('tab-content');				 
			$('.tab-content').hide();
			$(tab_content).show(); 
			$('.tabs .tabs-item').removeClass('ui-state-active');
			$(this).addClass('ui-state-active');
		});
	});
	
	$.fn.portalDialogue = function(option, callback, callbackcancel) {
		var self   = this;
		var title   = option.title || 'Confirm!';
		var confirm   = option.confirm || false;
		var btnClose   = option.btnClose || 'Cancel';
		var btnConfirm   = option.btnConfirm || 'OK';
		
		$(this).find('.modal-title').text(title);
		$(this).find('.btnClose').html(btnClose);
		$(this).find('.btnConfirm').html(btnConfirm); 
		if(option.description != undefined)
			$(this).find('.modal-body').html(option.description);
		if (confirm) {
			$(this).find('.btn.default').addClass('btn-default');
			$(this).find('.btn.confirm').removeClass('hidden').addClass('btn-primary').unbind('click').bind('click',function(e){
				var $link = $(e.target);
				e.preventDefault();
				if(!$link.data('lockedAt') || +new Date() - $link.data('lockedAt') > 200) {
					var res = callback();									
					if(res != false)
						$(self).modal('hide');
				}
				$link.data('lockedAt', +new Date());

				//var res = callback();									
				//if(res != false)
				//	$(self).modal('hide');
			});
			$(this).find('.btn.cancel').unbind('click');
			if(callbackcancel != null && callbackcancel != undefined){
				$(this).find('.btn.cancel').bind('click', function(){
					$(self).modal('hide');
					callbackcancel;
				});
			}
		} else {
			$(this).find('.btn.default').addClass('btn-primary');
			$(this).find('.btn.confirm').addClass('hidden'); 
		}
		$(this).modal({ backdrop: 'static', // disable close modal when click outside of modal form
						keyboard: false});  // disable escape button (not close modal when press esc button)
		$(this).modal('show');
	};
});
function is_email(email) {
	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}



function init_timezone(selector, default_val){
	var timezones = 'Etc/GMT+12|-12:00,Etc/GMT+11|-11:00,Pacific/Midway|-11:00,Pacific/Niue|-11:00,Pacific/Pago_Pago|-11:00,Pacific/Samoa|-11:00,US/Samoa|-11:00,Etc/GMT+10|-10:00,HST|-10:00,Pacific/Honolulu|-10:00,Pacific/Johnston|-10:00,Pacific/Rarotonga|-10:00,Pacific/Tahiti|-10:00,US/Hawaii|-10:00,Pacific/Marquesas|-09:30,America/Adak|-09:00,America/Atka|-09:00,Etc/GMT+9|-09:00,Pacific/Gambier|-09:00,US/Aleutian|-09:00,America/Anchorage|-08:00,America/Juneau|-08:00,America/Metlakatla|-08:00,America/Nome|-08:00,America/Sitka|-08:00,America/Yakutat|-08:00,Etc/GMT+8|-08:00,Pacific/Pitcairn|-08:00,US/Alaska|-08:00,America/Creston|-07:00,America/Dawson|-07:00,America/Dawson_Creek|-07:00,America/Ensenada|-07:00,America/Hermosillo|-07:00,America/Los_Angeles|-07:00,America/Phoenix|-07:00,America/Santa_Isabel|-07:00,America/Tijuana|-07:00,America/Vancouver|-07:00,America/Whitehorse|-07:00,Canada/Pacific|-07:00,Canada/Yukon|-07:00,Etc/GMT+7|-07:00,MST|-07:00,Mexico/BajaNorte|-07:00,PST8PDT|-07:00,US/Arizona|-07:00,US/Pacific|-07:00,US/Pacific-New|-07:00,America/Belize|-06:00,America/Boise|-06:00,America/Cambridge_Bay|-06:00,America/Chihuahua|-06:00,America/Costa_Rica|-06:00,America/Denver|-06:00,America/Edmonton|-06:00,America/El_Salvador|-06:00,America/Guatemala|-06:00,America/Inuvik|-06:00,America/Managua|-06:00,America/Mazatlan|-06:00,America/Ojinaga|-06:00,America/Regina|-06:00,America/Shiprock|-06:00,America/Swift_Current|-06:00,America/Tegucigalpa|-06:00,America/Yellowknife|-06:00,Canada/East-Saskatchewan|-06:00,Canada/Mountain|-06:00,Canada/Saskatchewan|-06:00,Chile/EasterIsland|-06:00,Etc/GMT+6|-06:00,MST7MDT|-06:00,Mexico/BajaSur|-06:00,Navajo|-06:00,Pacific/Easter|-06:00,Pacific/Galapagos|-06:00,US/Mountain|-06:00,America/Atikokan|-05:00,America/Bahia_Banderas|-05:00,America/Bogota|-05:00,America/Cancun|-05:00,America/Cayman|-05:00,America/Chicago|-05:00,America/Coral_Harbour|-05:00,America/Eirunepe|-05:00,America/Guayaquil|-05:00,America/Indiana/Knox|-05:00,America/Indiana/Tell_City|-05:00,America/Jamaica|-05:00,America/Knox_IN|-05:00,America/Lima|-05:00,America/Matamoros|-05:00,America/Menominee|-05:00,America/Merida|-05:00,America/Mexico_City|-05:00,America/Monterrey|-05:00,America/North_Dakota/Beulah|-05:00,America/North_Dakota/Center|-05:00,America/North_Dakota/New_Salem|-05:00,America/Panama|-05:00,America/Porto_Acre|-05:00,America/Rainy_River|-05:00,America/Rankin_Inlet|-05:00,America/Resolute|-05:00,America/Rio_Branco|-05:00,America/Winnipeg|-05:00,Brazil/Acre|-05:00,CST6CDT|-05:00,Canada/Central|-05:00,EST|-05:00,Etc/GMT+5|-05:00,Jamaica|-05:00,Mexico/General|-05:00,US/Central|-05:00,US/Indiana-Starke|-05:00,America/Caracas|-04:30,America/Anguilla|-04:00,America/Antigua|-04:00,America/Aruba|-04:00,America/Asuncion|-04:00,America/Barbados|-04:00,America/Blanc-Sablon|-04:00,America/Boa_Vista|-04:00,America/Campo_Grande|-04:00,America/Cuiaba|-04:00,America/Curacao|-04:00,America/Detroit|-04:00,America/Dominica|-04:00,America/Fort_Wayne|-04:00,America/Grand_Turk|-04:00,America/Grenada|-04:00,America/Guadeloupe|-04:00,America/Guyana|-04:00,America/Havana|-04:00,America/Indiana/Indianapolis|-04:00,America/Indiana/Marengo|-04:00,America/Indiana/Petersburg|-04:00,America/Indiana/Vevay|-04:00,America/Indiana/Vincennes|-04:00,America/Indiana/Winamac|-04:00,America/Indianapolis|-04:00,America/Iqaluit|-04:00,America/Kentucky/Louisville|-04:00,America/Kentucky/Monticello|-04:00,America/Kralendijk|-04:00,America/La_Paz|-04:00,America/Louisville|-04:00,America/Lower_Princes|-04:00,America/Manaus|-04:00,America/Marigot|-04:00,America/Martinique|-04:00,America/Montreal|-04:00,America/Montserrat|-04:00,America/Nassau|-04:00,America/New_York|-04:00,America/Nipigon|-04:00,America/Pangnirtung|-04:00,America/Port-au-Prince|-04:00,America/Port_of_Spain|-04:00,America/Porto_Velho|-04:00,America/Puerto_Rico|-04:00,America/Santiago|-04:00,America/Santo_Domingo|-04:00,America/St_Barthelemy|-04:00,America/St_Kitts|-04:00,America/St_Lucia|-04:00,America/St_Thomas|-04:00,America/St_Vincent|-04:00,America/Thunder_Bay|-04:00,America/Toronto|-04:00,America/Tortola|-04:00,America/Virgin|-04:00,Antarctica/Palmer|-04:00,Brazil/West|-04:00,Canada/Eastern|-04:00,Chile/Continental|-04:00,Cuba|-04:00,EST5EDT|-04:00,Etc/GMT+4|-04:00,US/East-Indiana|-04:00,US/Eastern|-04:00,US/Michigan|-04:00,America/Araguaina|-03:00,America/Argentina/Buenos_Aires|-03:00,America/Argentina/Catamarca|-03:00,America/Argentina/ComodRivadavia|-03:00,America/Argentina/Cordoba|-03:00,America/Argentina/Jujuy|-03:00,America/Argentina/La_Rioja|-03:00,America/Argentina/Mendoza|-03:00,America/Argentina/Rio_Gallegos|-03:00,America/Argentina/Salta|-03:00,America/Argentina/San_Juan|-03:00,America/Argentina/San_Luis|-03:00,America/Argentina/Tucuman|-03:00,America/Argentina/Ushuaia|-03:00,America/Bahia|-03:00,America/Belem|-03:00,America/Buenos_Aires|-03:00,America/Catamarca|-03:00,America/Cayenne|-03:00,America/Cordoba|-03:00,America/Fortaleza|-03:00,America/Glace_Bay|-03:00,America/Goose_Bay|-03:00,America/Halifax|-03:00,America/Jujuy|-03:00,America/Maceio|-03:00,America/Mendoza|-03:00,America/Moncton|-03:00,America/Montevideo|-03:00,America/Paramaribo|-03:00,America/Recife|-03:00,America/Rosario|-03:00,America/Santarem|-03:00,America/Sao_Paulo|-03:00,America/Thule|-03:00,Antarctica/Rothera|-03:00,Atlantic/Bermuda|-03:00,Atlantic/Stanley|-03:00,Brazil/East|-03:00,Canada/Atlantic|-03:00,Etc/GMT+3|-03:00,America/St_Johns|-02:30,Canada/Newfoundland|-02:30,America/Godthab|-02:00,America/Miquelon|-02:00,America/Noronha|-02:00,Atlantic/South_Georgia|-02:00,Brazil/DeNoronha|-02:00,Etc/GMT+2|-02:00,Atlantic/Cape_Verde|-01:00,Etc/GMT+1|-01:00,Africa/Abidjan|+00:00,Africa/Accra|+00:00,Africa/Bamako|+00:00,Africa/Banjul|+00:00,Africa/Bissau|+00:00,Africa/Conakry|+00:00,Africa/Dakar|+00:00,Africa/Freetown|+00:00,Africa/Lome|+00:00,Africa/Monrovia|+00:00,Africa/Nouakchott|+00:00,Africa/Ouagadougou|+00:00,Africa/Sao_Tome|+00:00,Africa/Timbuktu|+00:00,America/Danmarkshavn|+00:00,America/Scoresbysund|+00:00,Atlantic/Azores|+00:00,Atlantic/Reykjavik|+00:00,Atlantic/St_Helena|+00:00,Etc/GMT|+00:00,Etc/GMT+0|+00:00,Etc/GMT-0|+00:00,Etc/GMT0|+00:00,Etc/Greenwich|+00:00,Etc/UCT|+00:00,Etc/UTC|+00:00,Etc/Universal|+00:00,Etc/Zulu|+00:00,GMT|+00:00,GMT+0|+00:00,GMT-0|+00:00,GMT0|+00:00,Greenwich|+00:00,Iceland|+00:00,UCT|+00:00,UTC|+00:00,Universal|+00:00,Zulu|+00:00,Africa/Algiers|+01:00,Africa/Bangui|+01:00,Africa/Brazzaville|+01:00,Africa/Casablanca|+01:00,Africa/Douala|+01:00,Africa/El_Aaiun|+01:00,Africa/Kinshasa|+01:00,Africa/Lagos|+01:00,Africa/Libreville|+01:00,Africa/Luanda|+01:00,Africa/Malabo|+01:00,Africa/Ndjamena|+01:00,Africa/Niamey|+01:00,Africa/Porto-Novo|+01:00,Africa/Tunis|+01:00,Africa/Windhoek|+01:00,Atlantic/Canary|+01:00,Atlantic/Faeroe|+01:00,Atlantic/Faroe|+01:00,Atlantic/Madeira|+01:00,Eire|+01:00,Etc/GMT-1|+01:00,Europe/Belfast|+01:00,Europe/Dublin|+01:00,Europe/Guernsey|+01:00,Europe/Isle_of_Man|+01:00,Europe/Jersey|+01:00,Europe/Lisbon|+01:00,Europe/London|+01:00,GB|+01:00,GB-Eire|+01:00,Portugal|+01:00,WET|+01:00,Africa/Blantyre|+02:00,Africa/Bujumbura|+02:00,Africa/Ceuta|+02:00,Africa/Gaborone|+02:00,Africa/Harare|+02:00,Africa/Johannesburg|+02:00,Africa/Kigali|+02:00,Africa/Lubumbashi|+02:00,Africa/Lusaka|+02:00,Africa/Maputo|+02:00,Africa/Maseru|+02:00,Africa/Mbabane|+02:00,Africa/Tripoli|+02:00,Antarctica/Troll|+02:00,Arctic/Longyearbyen|+02:00,Atlantic/Jan_Mayen|+02:00,CET|+02:00,Etc/GMT-2|+02:00,Europe/Amsterdam|+02:00,Europe/Andorra|+02:00,Europe/Belgrade|+02:00,Europe/Berlin|+02:00,Europe/Bratislava|+02:00,Europe/Brussels|+02:00,Europe/Budapest|+02:00,Europe/Busingen|+02:00,Europe/Copenhagen|+02:00,Europe/Gibraltar|+02:00,Europe/Kaliningrad|+02:00,Europe/Ljubljana|+02:00,Europe/Luxembourg|+02:00,Europe/Madrid|+02:00,Europe/Malta|+02:00,Europe/Monaco|+02:00,Europe/Oslo|+02:00,Europe/Paris|+02:00,Europe/Podgorica|+02:00,Europe/Prague|+02:00,Europe/Rome|+02:00,Europe/San_Marino|+02:00,Europe/Sarajevo|+02:00,Europe/Skopje|+02:00,Europe/Stockholm|+02:00,Europe/Tirane|+02:00,Europe/Vaduz|+02:00,Europe/Vatican|+02:00,Europe/Vienna|+02:00,Europe/Warsaw|+02:00,Europe/Zagreb|+02:00,Europe/Zurich|+02:00,Libya|+02:00,MET|+02:00,Poland|+02:00,Africa/Addis_Ababa|+03:00,Africa/Asmara|+03:00,Africa/Asmera|+03:00,Africa/Cairo|+03:00,Africa/Dar_es_Salaam|+03:00,Africa/Djibouti|+03:00,Africa/Juba|+03:00,Africa/Kampala|+03:00,Africa/Khartoum|+03:00,Africa/Mogadishu|+03:00,Africa/Nairobi|+03:00,Antarctica/Syowa|+03:00,Asia/Aden|+03:00,Asia/Amman|+03:00,Asia/Baghdad|+03:00,Asia/Bahrain|+03:00,Asia/Beirut|+03:00,Asia/Damascus|+03:00,Asia/Gaza|+03:00,Asia/Hebron|+03:00,Asia/Istanbul|+03:00,Asia/Jerusalem|+03:00,Asia/Kuwait|+03:00,Asia/Nicosia|+03:00,Asia/Qatar|+03:00,Asia/Riyadh|+03:00,Asia/Tel_Aviv|+03:00,EET|+03:00,Egypt|+03:00,Etc/GMT-3|+03:00,Europe/Athens|+03:00,Europe/Bucharest|+03:00,Europe/Chisinau|+03:00,Europe/Helsinki|+03:00,Europe/Istanbul|+03:00,Europe/Kiev|+03:00,Europe/Mariehamn|+03:00,Europe/Minsk|+03:00,Europe/Moscow|+03:00,Europe/Nicosia|+03:00,Europe/Riga|+03:00,Europe/Simferopol|+03:00,Europe/Sofia|+03:00,Europe/Tallinn|+03:00,Europe/Tiraspol|+03:00,Europe/Uzhgorod|+03:00,Europe/Vilnius|+03:00,Europe/Volgograd|+03:00,Europe/Zaporozhye|+03:00,Indian/Antananarivo|+03:00,Indian/Comoro|+03:00,Indian/Mayotte|+03:00,Israel|+03:00,Turkey|+03:00,W-SU|+03:00,Asia/Dubai|+04:00,Asia/Muscat|+04:00,Asia/Tbilisi|+04:00,Asia/Yerevan|+04:00,Etc/GMT-4|+04:00,Europe/Samara|+04:00,Indian/Mahe|+04:00,Indian/Mauritius|+04:00,Indian/Reunion|+04:00,Asia/Kabul|+04:30,Asia/Tehran|+04:30,Iran|+04:30,Antarctica/Mawson|+05:00,Asia/Aqtau|+05:00,Asia/Aqtobe|+05:00,Asia/Ashgabat|+05:00,Asia/Ashkhabad|+05:00,Asia/Baku|+05:00,Asia/Dushanbe|+05:00,Asia/Karachi|+05:00,Asia/Oral|+05:00,Asia/Samarkand|+05:00,Asia/Tashkent|+05:00,Asia/Yekaterinburg|+05:00,Etc/GMT-5|+05:00,Indian/Kerguelen|+05:00,Indian/Maldives|+05:00,Asia/Calcutta|+05:30,Asia/Colombo|+05:30,Asia/Kolkata|+05:30,Asia/Kathmandu|+05:45,Asia/Katmandu|+05:45,Antarctica/Vostok|+06:00,Asia/Almaty|+06:00,Asia/Bishkek|+06:00,Asia/Dacca|+06:00,Asia/Dhaka|+06:00,Asia/Kashgar|+06:00,Asia/Novosibirsk|+06:00,Asia/Omsk|+06:00,Asia/Qyzylorda|+06:00,Asia/Thimbu|+06:00,Asia/Thimphu|+06:00,Asia/Urumqi|+06:00,Etc/GMT-6|+06:00,Indian/Chagos|+06:00,Asia/Rangoon|+06:30,Indian/Cocos|+06:30,Antarctica/Davis|+07:00,Asia/Bangkok|+07:00,Asia/Ho_Chi_Minh|+07:00,Asia/Hovd|+07:00,Asia/Jakarta|+07:00,Asia/Krasnoyarsk|+07:00,Asia/Novokuznetsk|+07:00,Asia/Phnom_Penh|+07:00,Asia/Pontianak|+07:00,Asia/Saigon|+07:00,Asia/Vientiane|+07:00,Etc/GMT-7|+07:00,Indian/Christmas|+07:00,Antarctica/Casey|+08:00,Asia/Brunei|+08:00,Asia/Chita|+08:00,Asia/Choibalsan|+08:00,Asia/Chongqing|+08:00,Asia/Chungking|+08:00,Asia/Harbin|+08:00,Asia/Hong_Kong|+08:00,Asia/Irkutsk|+08:00,Asia/Kuala_Lumpur|+08:00,Asia/Kuching|+08:00,Asia/Macao|+08:00,Asia/Macau|+08:00,Asia/Makassar|+08:00,Asia/Manila|+08:00,Asia/Shanghai|+08:00,Asia/Singapore|+08:00,Asia/Taipei|+08:00,Asia/Ujung_Pandang|+08:00,Asia/Ulaanbaatar|+08:00,Asia/Ulan_Bator|+08:00,Australia/Perth|+08:00,Australia/West|+08:00,Etc/GMT-8|+08:00,Hongkong|+08:00,PRC|+08:00,ROC|+08:00,Singapore|+08:00,Australia/Eucla|+08:45,Asia/Dili|+09:00,Asia/Jayapura|+09:00,Asia/Khandyga|+09:00,Asia/Pyongyang|+09:00,Asia/Seoul|+09:00,Asia/Tokyo|+09:00,Asia/Yakutsk|+09:00,Etc/GMT-9|+09:00,Japan|+09:00,Pacific/Palau|+09:00,ROK|+09:00,Australia/Adelaide|+09:30,Australia/Broken_Hill|+09:30,Australia/Darwin|+09:30,Australia/North|+09:30,Australia/South|+09:30,Australia/Yancowinna|+09:30,Antarctica/DumontDUrville|+10:00,Asia/Magadan|+10:00,Asia/Sakhalin|+10:00,Asia/Ust-Nera|+10:00,Asia/Vladivostok|+10:00,Australia/ACT|+10:00,Australia/Brisbane|+10:00,Australia/Canberra|+10:00,Australia/Currie|+10:00,Australia/Hobart|+10:00,Australia/Lindeman|+10:00,Australia/Melbourne|+10:00,Australia/NSW|+10:00,Australia/Queensland|+10:00,Australia/Sydney|+10:00,Australia/Tasmania|+10:00,Australia/Victoria|+10:00,Etc/GMT-10|+10:00,Pacific/Chuuk|+10:00,Pacific/Guam|+10:00,Pacific/Port_Moresby|+10:00,Pacific/Saipan|+10:00,Pacific/Truk|+10:00,Pacific/Yap|+10:00,Australia/LHI|+10:30,Australia/Lord_Howe|+10:30,Antarctica/Macquarie|+11:00,Asia/Srednekolymsk|+11:00,Etc/GMT-11|+11:00,Pacific/Bougainville|+11:00,Pacific/Efate|+11:00,Pacific/Guadalcanal|+11:00,Pacific/Kosrae|+11:00,Pacific/Noumea|+11:00,Pacific/Pohnpei|+11:00,Pacific/Ponape|+11:00,Pacific/Norfolk|+11:30,Antarctica/McMurdo|+12:00,Antarctica/South_Pole|+12:00,Asia/Anadyr|+12:00,Asia/Kamchatka|+12:00,Etc/GMT-12|+12:00,Kwajalein|+12:00,NZ|+12:00,Pacific/Auckland|+12:00,Pacific/Fiji|+12:00,Pacific/Funafuti|+12:00,Pacific/Kwajalein|+12:00,Pacific/Majuro|+12:00,Pacific/Nauru|+12:00,Pacific/Tarawa|+12:00,Pacific/Wake|+12:00,Pacific/Wallis|+12:00,NZ-CHAT|+12:45,Pacific/Chatham|+12:45,Etc/GMT-13|+13:00,Pacific/Apia|+13:00,Pacific/Enderbury|+13:00,Pacific/Fakaofo|+13:00,Pacific/Tongatapu|+13:00,Etc/GMT-14|+14:00,Pacific/Kiritimati|+14:00'.split(',');
	var client_timezone_gtm = get_timezone();	
	var html = '';
	var found = false;
	for(var i=0; i < timezones.length; i++){
		timezone = timezones[i].split('|');
		//if(timezone[1] == client_timezone_gtm && found == false){
		if(timezone[0] == default_val && found == false){
			found = true;
			html += '<option value="' + timezones[i] + '" offset="' + timezone[1] + '" selected>' + '(GTM ' + timezone[1] + ' ) ' + timezone[0] + '</option>';
		}
		else
			html += '<option value="' + timezones[i] + '" offset="' + timezone[1] + '">' + '(GTM ' + timezone[1] + ' ) ' + timezone[0] + '</option>';
	}
	$(selector).html(html);
	
}
function get_timezone(){
	var timezone_offset = new Date().getTimezoneOffset(); // example: -420 = +07:00	
	timezone_offset = parseInt(timezone_offset);
	var timezone = Math.ceil(timezone_offset / 60);
	if(timezone == 0)
		return '+00:00';
	else{
		var sign = timezone > 0 ? "-" : "+";
		timezone = timezone >= 0 ? timezone : (-1) * timezone;
		if(timezone < 0 || timezone > 12)
			timezone = 0;
		return sign + (timezone > 9 ? timezone : "0" + timezone) + ":00";
	}
}
function change_schedule(){
	var schedule = $('#schedule option:selected').val();
	if(schedule == 'daily'){
		$('#weekly_container, #monthly_container').hide();
	}else if(schedule == 'weekly'){
		$('#weekly_container').show();
		$('#monthly_container').hide();
	}else if(schedule == 'monthly'){
		$('#weekly_container').hide();
		$('#monthly_container').show();
	}
}

var g_timeout_interval = null;
var g_session_time = 0;

function setSessionTimeOut(seconds){
	if(!location.pathname.indexOf('/login') == 0){
		g_session_time = seconds;
		if(g_timeout_interval)
			clearInterval(g_timeout_interval);
		
		g_timeout_interval = setInterval(function() {
			g_session_time = g_session_time - 1;
			if(g_session_time == 0){
				// timeout
				clearInterval(g_timeout_interval);
				window.location = 'login';
			}
			else if(g_session_time < 60 && g_session_time > 0){ // khi thoi gian chi con < 1phut => hien thi canh bao
				$('#session_alert').show().find('span').html("Session will timeout on " + g_session_time + ' seconds');
			}
			//$("label").text(SessionTime);
		}, 1000);
	}
}
function extendTimeout(){
	// call server extends timeout
	g_session_time = 120;
	xajax_extend_session();
	$('#session_alert').hide();
}



function toast_success(text, functionOnOk){
	if(functionOnOk == undefined) functionOnOk = null;
	toast(text, "success", "#3C763D", "white", functionOnOk); 
}
function toast_error(text, functionOnOk){
	if(functionOnOk == undefined) functionOnOk = null;
	toast(text, "error", "#A94442", "white", functionOnOk);
}
function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function toast(text, icon, background_color, text_color, functionOnOk){
	$.toast({ 
		text : text, 
		heading: ucfirst(icon),
		showHideTransition : 'slide',  // It can be plain, fade or slide
		bgColor : background_color,              // Background color for toast
		textColor : text_color,            // text color
		allowToastClose : false,       // Show the close button or not
		hideAfter : 5000,              // `false` to make it sticky or time in miliseconds to hide after
		stack : 5,                     // `fakse` to show one stack at a time count showing the number of toasts that can be shown at once
		textAlign : 'left',            // Alignment of text i.e. left, right, center
		position : 'bottom-center',       // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values to position the toast on page
		allowToastClose: true, 
		icon: icon
	});
	if(functionOnOk != undefined && functionOnOk != null)
		functionOnOk();
}