var isInpopup = null;
$(function(){
    chrome.runtime.sendMessage({action: "getSessions"},
        function (response) {
            //console.log(response);
            for(let sessionId in response){
                let session = response[sessionId],
                    sessShow = $('<div class="session-show">');
                sessShow.append('<span class="name">' + session.time + '</span>');
                sessShow.append('<button class="count">(' + chrome.i18n.getMessage('count_tabs',[session.tabs.length]) + ') </button>');
                sessShow.append('<button class="open">'+chrome.i18n.getMessage('load')+'</button>');
                sessShow.append('<button class="remove">'+chrome.i18n.getMessage('remove')+'</button>');
                sessShow.append('<ul class="tabs-list"></ul>');
                let list = sessShow.find('.tabs-list');
                for(let tab of session.tabs){
                    list.append('<li>' + tab.title.substr(0,22) + '</li>');
                }
                sessShow.find('.open').click(function(){
                    chrome.runtime.sendMessage({action: "openSession",time: session.time});
                });
                sessShow.find('.count').click(function(){
                    jQuery(this).parent().find('.tabs-list').toggle();
                });
                sessShow.find('.remove').click(function(){
                    //let li = $(this).closest('li');
                    chrome.runtime.sendMessage({action: "removeSession",time: session.time},{}, function(response){
                        //console.log(response);
                        if(response){
                            //console.log('li', sessShow); 
                            sessShow.remove();
                        }
                    });

                });
                $('.recent-sessions').append(sessShow);
            }
        });

    $('.recent').text(chrome.i18n.getMessage('recent_title'))
    $('#new-session').click(function(){
         chrome.permissions.contains({
            permissions: ['tabs']},function(status){
                if(status){
                    chrome.runtime.sendMessage({action: "addSession"});
                }
                else{
                    chrome.permissions.request({
                        permissions: ['tabs']},function(status){
                            if(status){
                                chrome.runtime.sendMessage({action: "addSession"});
                            }
                            else{
                                alert('Cant save session without permissions')
                            }
                    });
                }
            });
        });
        chrome.runtime.sendMessage({action: "isUsedAlready"},function(usedAlready){
            if(usedAlready){
                isInpopup = true;
                checkIfRankNeededAndAndAddRank();
            }
        });
});