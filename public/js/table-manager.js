function loadNerdTables(qualifier){
    renderFromServer('/templates/nerd-table-list.ejs', '/data/nerdTables',
   {isSearch: false, listQualifier: qualifier}, function(html){
        $(qualifier).html(html);
    });
}

function searchNerdTables(qualifier, searchObj, refreshList){
    renderFromServer('/templates/nerd-table-list.ejs', '/data/nerdTables/search',
    {isSearch: true, listQualifier: refreshList}, function(html){
        $(qualifier).html(html);
    }, searchObj)
}

function doSearch(searchInput, searchField, searchTable, listQualifier){
    var searchObj = {
        searchTerm: $(searchInput).val(),
        searchField: $(searchField).val()
    }
    searchNerdTables(searchTable, searchObj, listQualifier);
}

function renderFromServer(template, serverPath, extraData, callback, searchObj){
    if(!searchObj){
        $.get( serverPath, function( data ) {
            var html;
            if(data === 'error'){
                html = 'Error loading nerd tables';
            }
            else{
                data.extras = extraData;
                html = new EJS({url:template}).render(data);
            }
            callback(html);
        });
    }
    else{
        $.post( serverPath, searchObj, function( data ) {
                var html;
                if(data === 'error'){
                    html = 'Error loading nerd tables';
                }
                else{
                    data.extras = extraData;
                    html = new EJS({url:template}).render(data);
                }
                callback(html);
            });
    }
}

function registerJoinForm(qualifier, list, error){
    $(qualifier).submit(function(event){
        event.preventDefault();
        var form = $(qualifier)[0].elements,
            tableID = form.tableID.value;
        joinTable(tableID, list, error);
    });
}

function joinTable(id, list, error){
    $.post('/tables/join', {tableID: id}, function(res){
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