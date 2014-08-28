function loadNerdTables(qualifier){
    renderFromServer('/templates/nerd-table-list.ejs', '/data/nerdTables',
   {isSearch: false, isActiveUser: true, listQualifier: qualifier}, function(html){
        $(qualifier).html(html);
    });
}

function loadMembers(tableID, qualifier){
    renderFromServer('/templates/user-list.ejs', '/data/nerdTables/members',
   {isTableMembers: true, listQualifier: qualifier}, function(html){
        $(qualifier).html(html);
    }, {id: tableID});
}

function loadTables(userID, qualifier){
    renderFromServer('/templates/nerd-table-list.ejs', '/data/users/tables',
   {isSearch: false, isActiveUser: false, listQualifier: qualifier}, function(html){
        $(qualifier).html(html);
    }, {id: userID});
}

function searchNerdTables(qualifier, searchObj, refreshList){
    renderFromServer('/templates/nerd-table-list.ejs', '/data/nerdTables/search',
    {isSearch: true, isActiveUser: true, listQualifier: refreshList}, function(html){
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
                html = 'Error loading content';
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
                    html = 'Error loading content';
                }
                else{
                    data.extras = extraData;
                    html = new EJS({url:template}).render(data);
                }
                callback(html);
            });
    }
}

function joinTable(id, list, error, members, callback){
    $.post('/tables/join', {tableID: id}, function(res){
        if(list && res === 'error 0'){
            if(members){
                loadMembers(id, list);
            }
            else{
                loadNerdTables(list);
            }
            if(error){
                $(error).html('');
            }
            callback();
        }
        else if(error && res === 'error -1'){
            $(error).html('You are already a member');
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

function createTable(form, error, verify){
    $.post('/tables/create', {
        name: form.name.value,
        location: form.location.value
        }, function(response){
            if((/^success/).test(response)){
                $(error).html('');
                $(verify).html('Table created successfully');
                if(form.autoAdd.checked){
                    joinTable(response.substring(8));
                }
            }
            else if(response === 'error missing'){
                $(verify).html('');
                $(error).html('Missing Information');
            }
            else if(error && response === 'error exists'){
                $(verify).html('');
                $(error).html('A table with that name already exists');
            }
        });
}

function dropTable(id, list, members, callback){
    $.post('/tables/drop', {tableID: id}, function(res){
        if(list && res === 'success'){
            if(members){
                loadMembers(id, list);
            }
            else{
                loadNerdTables(list);
            }
            callback();
        }
        else{
            console.log(res);
        }
    });
}