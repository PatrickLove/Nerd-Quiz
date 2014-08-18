function loadNerdTables(qualifier){
    $(qualifier).html('Loading Nerd Tables');
    renderFromServer('/templates/nerd-table-list.ejs', '/data/nerdTables', function(html){
        $(qualifier).html(html);
    });
}

function renderFromServer(template, serverPath, callback){
    $.get( serverPath, function( data ) {
        var html;
        if(data === 'error'){
            html = 'Error loading nerd tables';
        }
        else{
            html = new EJS({url:template}).render(data);
        }
        callback(html);
    });
}

function registerJoinForm(qualifier, list, error){
    $(qualifier).submit(function(event){
        event.preventDefault();
        joinTable(qualifier, list, error);
    });
}

function joinTable(qualifier, list, error){
    var form = $(qualifier)[0].elements,
        tableID = form.tableID.value;
    $.post('/tables/join', {tableID: tableID}, function(res){
        if(list && res === 'error 0'){
            loadNerdTables(list);
            if(error){
                $(error).html('');
            }
        }
        else if(error && res === 'error -1'){
            $(error).html('You are already a member of that table');
        }
        else if(error && res === 'error 1'){
            $(error).html('No tables match that id');
        }
        else if(error && res === 'error 2'){
            $(error).html('Missing user info, please logout and log back in');
        }
        else if(error && res === 'error 3'){
            $(error).html('Missing Information');
        }
        else if(error){
            $(error).html('Server Error');
        }
    });
}

function dropTable(id, list){
    console.log(id);
    $.post('tables/drop', {tableID: id}, function(res){
        if(list && res === 'success'){
            loadNerdTables(list);
        }
        else{
            console.log(res);
        }
    });
}