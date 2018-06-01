function fixNumber(num){
	let numAsStr = '' + num;
	if(numAsStr.length = 1){
		numAsStr = '0' + numAsStr;
	} 
	return numAsStr;
}

chrome.runtime.setUninstallURL("https://1ce.org");

if (!localStorage.created) {
  chrome.tabs.create({ url: "https://1ce.org" });
  var manifest = chrome.runtime.getManifest();
  localStorage.ver = manifest.version;
  localStorage.created = 1;
}

SessionsStore = {
	getAllSessions : function(){
		return SessionsStore.getJson('sessions');
	},
	addSession: function(item){
		items = SessionsStore.getAllSessions();
		//console.log('items', items);
		items[item.time] = item;
		SessionsStore.storeJson('sessions',items);
	},
	storeJson : function(name, data){
        localStorage.setItem(name, JSON.stringify(data));
    },
    getJson : function(name){
        let data = '';
        try{
            data = JSON.parse(localStorage.getItem(name));
        }
        catch(e){

        }
        return data ? data : {};
    },
}

chrome.browserAction.onClicked.addListener(function(tab) { 
    chrome.tabs.create({url:chrome.extension.getURL('pages/notepad.html')})  
});

chrome.runtime.onMessage.addListener( function(request,sender,sendResponse)
{
    if( request.action === "getSessions" )
    {
        sendResponse(SessionsStore.getAllSessions());      
    }
    if( request.action === "openSession" )
    {
        let sessions = SessionsStore.getAllSessions(),
        	selectedSession = sessions[request.time];
         
        if(selectedSession){
        	chrome.tabs.query({currentWindow: true}, function(tabs) {
	         	let tabsIds = [];
	         	for(let tab of tabs){
	         		tabsIds.push(tab.id);
	         	}
	         	chrome.tabs.remove(tabsIds);
	         	for(let tab of selectedSession.tabs){
	        		//console.log(tab);
	        		if(tab){
	        			chrome.tabs.create({ url:tab.url});
	        		}
	        	}
	         });
        	//console.log(selectedSession,sessions);
        	
        }
        sendResponse();      
    }
    if( request.action === "addSession" )
    {
        chrome.tabs.query({currentWindow: true}, function(tabs) {
		    var currTime = new Date(),
		    	currentSession = {
			    	time : [fixNumber(currTime.getDate()), fixNumber(currTime.getMonth()) + 1 , currTime.getFullYear()].join('/') + ' ' + currTime.getHours() + ':' + currTime.getMinutes(),
			    	tabs : []
			    };
		    tabs.forEach(function(tab) {
		        currentSession.tabs.push({
		        	title: tab.title,
		        	url:tab.url
		        });
		    });
		    SessionsStore.addSession(currentSession);
		});     
    }
    if( request.action === "removeSession" )
    {
    	let sessions = SessionsStore.getAllSessions();
        delete(sessions[request.time]);
        SessionsStore.storeJson('sessions', sessions);
        sendResponse(true);

    }
});
