$(function(){
    $('#dialog-div').dialog({
        autoOpen: false,
        buttons: {
            Ok: function() {
                $(this).dialog('close');
            }
        },
        dialogClass: 'no-close'
    });
});

function validateForm(){
    var form = document.forms.accountForm.elements,
        pwd = form.password.value,
        confirm = form.password2.value;
    if(pwd != confirm){
        $('#dialog-div').dialog('open');
        return false;
    }
    return true;
}