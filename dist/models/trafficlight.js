!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.GentlemanX=t():e.GentlemanX=t()}(self,(function(){return(()=>{"use strict";var e={607:e=>{e.exports=JSON.parse('{"name":"Traffic Light","concepts":[{"name":"light"},{"name":"mode"}]}')},832:e=>{e.exports=JSON.parse('{"concept":[{"id":"b1ab20b1-595a-4a46-9804-17bb1930cdf1","name":"state","nature":"prototype","attributes":[{"name":"name","target":{"name":"name"},"required":true,"description":""},{"name":"behaviour","target":{"name":"set","accept":{"name":"behaviour"},"ordered":true,"constraint":{"cardinality":{"type":"range","range":{"min":{"value":1}}}}},"required":true}],"properties":[]},{"id":"ca5daf16-93ac-4c95-a0c0-80d3599131ea","prototype":"state","name":"light","nature":"concrete","attributes":[{"name":"color","target":{"name":"string","constraint":{"values":["red","yellow","green","white","black"]}},"required":true,"description":""},{"name":"shape","target":{"name":"string","default":"circle","constraint":{"values":["circle","rectangle","square","diamond","bus","person"]}},"required":false,"description":""}],"properties":[]},{"id":"d7844232-e13a-4c02-a56b-07827b85293d","prototype":"state","name":"mode","nature":"concrete","attributes":[{"name":"lights","target":{"name":"set","accept":{"name":"light"},"ordered":true},"required":true,"description":""},{"name":"start","target":{"name":"reference","accept":{"name":"light","scope":"mode","rel":"parent"}},"required":true}],"properties":[]},{"id":"b41351ab-0adb-4706-8e10-55ea34686ef6","name":"behaviour","nature":"prototype","attributes":[{"name":"target","target":{"name":"reference","accept":{"name":"state"}},"required":true}],"properties":[]},{"id":"77f7eeaa-6310-4130-8875-943eddae6f60","prototype":"behaviour","name":"temporal","nature":"concrete","attributes":[{"name":"value","target":{"name":"number"},"required":true,"description":""},{"name":"unit","target":{"name":"string","default":"s","constraint":{"values":["s","ms","min"]}},"required":true,"description":""}],"properties":[]},{"id":"4bdb5bf1-93cd-476d-bb67-4e41a564097e","prototype":"behaviour","name":"manual","nature":"concrete","attributes":[{"name":"button","target":{"name":"string"},"required":true,"description":""}],"properties":[]},{"id":"5bbb4d1f-9c3r-432d-f5e7-41697e4a50e4","name":"name","nature":"derivative","base":"string","constraint":{"length":{"type":"range","range":{"min":{"value":1},"max":{"value":50}}}}}]}')},523:e=>{e.exports=JSON.parse('{"projection":[{"id":"q1d94bi3-8fpr-63f2-970o-5bgade1f7030","type":"style","name":"box-left","style":{"gss":{"box":{"outer":{"left":{"value":6,"unit":"px"}}}}}},{"id":"q1d9p0i3-8fpr-63f2-970o-5bgade1f7030","type":"style","name":"label","style":{"gss":{"text":{"bold":500,"color":{"type":"hex","value":"#555"}}}}},{"id":"gca94b6c-0f9e-43f5-976b-de15bfaf7038","concept":{"name":"light"},"type":"layout","tags":[],"content":{"type":"stack","orientation":"vertical","disposition":[{"type":"layout","layout":{"type":"stack","orientation":"horizontal","disposition":[{"type":"static","static":{"type":"image","url":"https://cdn3.vectorstock.com/i/1000x1000/86/82/traffic-light-icon-vector-21088682.jpg","style":{"css":["label-icon"]}}},{"type":"layout","layout":{"type":"stack","orientation":"vertical","disposition":[{"type":"attribute","name":"color","tag":"color-label","required":true},{"type":"attribute","name":"name","tag":"name-label","required":true,"style":{"gss":{"box":{"outer":{"top":{"value":4,"unit":"px"}}}}}}]}}],"style":{"gss":{"box":{"inner":{"left":{"value":6,"unit":"px"},"bottom":{"value":6,"unit":"px"}}}}}}},{"type":"attribute","name":"behaviour","tag":"behaviours-header"},{"type":"attribute","name":"behaviour","tag":"behaviours"}],"style":{"css":["tl-light"]}}},{"id":"gcf9b6fc-0a9e-46b5-93f7-d815e03bfaf7","concept":{"name":"light"},"type":"layout","tags":["choice"],"content":{"type":"flex","alignItems":"center","disposition":[{"type":"attribute","name":"color","tag":"readonly-color","required":true},{"type":"attribute","name":"name","tag":"readonly","required":true,"style":{"ref":["box-left"]}}]}},{"id":"g4b6cca9-0df9-48q5-976b-5fw3b9daf7e1","concept":{"name":"mode"},"type":"layout","tags":[],"content":{"type":"stack","orientation":"vertical","disposition":[{"type":"layout","layout":{"type":"wrap","disposition":[{"type":"static","static":{"type":"text","content":"M","style":{"css":["tl-icon","tl-icon--mode"]}}},{"type":"static","static":{"type":"text","content":"Mode:","style":{"ref":["label"]}}},{"type":"attribute","name":"name","tag":"name","required":true,"style":{"ref":["box-left"]}}],"style":{"css":["tl-mode-header"],"gss":{"text":{"size":{"value":1.2,"unit":"em"}},"box":{"inner":{"top":{"value":6,"unit":"px"},"left":{"value":6,"unit":"px"},"bottom":{"value":6,"unit":"px"}}}}}}},{"type":"attribute","name":"start","tag":"state-label-reference","style":{"gss":{"box":{"inner":{"left":{"value":6,"unit":"px"}}}}}},{"type":"attribute","name":"lights","tag":"lights"},{"type":"attribute","name":"behaviour","tag":"behaviours-header"},{"type":"attribute","name":"behaviour","tag":"behaviours"}],"style":{"css":["tl-mode"]}}},{"id":"gca94b6c-0h7e-43f5-917b-bdae13f7f508","concept":{"name":"mode"},"type":"layout","tags":["choice"],"content":{"type":"wrap","disposition":[{"type":"static","static":{"type":"text","content":"M","style":{"css":["tl-icon","tl-icon--mode"]}}},{"type":"attribute","name":"name","tag":"readonly","required":true}]}},{"id":"cg46csa3-0f95-45vt-g62b-53f7edawbf91","concept":{"name":"behaviour"},"tags":["textual"],"type":"layout","content":{"type":"stack","orientation":"horizontal","disposition":[{"type":"field","field":{"type":"choice","choice":{"option":{"template":{"tag":"choice"},"style":{"css":["tl-behaviour-choice__list-option"]}},"style":{"css":["tl-behaviour-choice__list"]}},"input":false,"style":{"css":["tl-behaviour-choice"]}}},{"type":"projection","bind":"value","placeholder":false,"tag":"choice-selection","style":{"css":["primitive-constraint"]}}],"style":{"css":["inline"]}}},{"id":"1a61rr6a-6r32-4563-g564-42dee22t862","concept":{"name":"temporal"},"tags":["choice-selection"],"type":"layout","content":{"type":"stack","orientation":"horizontal","disposition":[{"type":"static","static":{"type":"text","content":"After"}},{"type":"attribute","name":"value","tag":"textual","style":{"ref":["box-left"]}},{"type":"attribute","name":"unit","tag":"simple-string","style":{"box":{"outer":{"left":{"value":2,"unit":"px"}}}}},{"type":"static","static":{"type":"text","content":"🠒","style":{"ref":["box-left"],"gss":{"text":{"bold":true,"size":{"value":2,"unit":"em"}}}}}},{"type":"attribute","name":"target","tag":"state-reference","style":{"ref":["box-left"]}}],"style":{"css":["temporal-config"]}}},{"id":"1adfrr6a-643d-5463-l64o-42z92s4f2eed","concept":{"name":"temporal"},"tags":["choice"],"type":"layout","content":{"type":"wrap","focusable":false,"disposition":[{"type":"static","static":{"type":"text","content":"Temporal"}}]}},{"id":"1a61rr6a-6r32-4563-l164-442ecfe282sd","concept":{"name":"manual"},"tags":["choice-selection"],"type":"layout","content":{"type":"stack","orientation":"horizontal","disposition":[{"type":"static","static":{"type":"text","content":[{"type":"raw","raw":"On "},{"type":"raw","raw":"signal","style":{"ref":["box-left"],"gss":{"text":{"italic":true}}}}]}},{"type":"static","static":{"type":"text","content":"🠒","style":{"ref":["box-left"],"gss":{"text":{"bold":true,"size":{"value":2,"unit":"em"}}}}}},{"type":"attribute","name":"target","tag":"state-reference","style":{"ref":["box-left"]}}],"style":{"css":["manual-config"]}}},{"id":"ab6se1ra-6f32-4p93-b864-442ecfe282sd","concept":{"name":"manual"},"tags":["choice"],"type":"layout","content":{"type":"wrap","focusable":false,"disposition":[{"type":"static","static":{"type":"text","content":"Manual"}}]}},{"id":"ab6se1ra-6f32-4e23-b864-44aecfe282e1","concept":{"name":"set"},"type":"field","tags":["behaviours"],"content":{"type":"list","readonly":false,"disabled":false,"list":{"item":{"template":{"tag":"","name":""},"style":{"css":["tl-behaviour-set__list-item"]}},"style":{"css":["tl-behaviour-set__list"]}},"action":{"add":false,"remove":{"content":[{"type":"static","static":{"type":"text","content":"✖"}}],"style":{"css":["tl-behaviour-set__btn-remove"]}}},"style":{"css":["tl-behaviour-set"]}}},{"id":"8f2d8871-b3a4-4l9f-b3fb-f3a56b886e15","concept":{"name":"set"},"type":"layout","tags":["behaviours-header"],"content":{"type":"wrap","disposition":[{"type":"static","static":{"type":"text","content":"Behaviour","style":{"css":["tl-behaviour-set-header__title"],"gss":{"text":{"bold":300,"transform":"uppercase"},"box":{"inner":{"left":{"value":6,"unit":"px"}}}}}}},{"type":"field","field":{"type":"list","readonly":false,"disabled":false,"list":false,"action":{"add":{"help":"Add a subsubtopic","content":[{"type":"static","static":{"type":"text","content":"+"}}],"style":{"css":["tl-behaviour-set-header__list-button"],"ref":["box-left"],"gss":{"text":{"size":{"value":2,"unit":"rem"},"bold":500}}}}},"style":{"css":["tl-behaviour-set-header__list"]}}}],"style":{"css":["tl-behaviour-set-header"],"gss":{"box":{"border":{"top":{"width":{"value":4,"unit":"px"},"color":{"type":"hex","value":"#ff857a"},"type":"solid"}}}}}}},{"id":"ab6se1ra-6f32-4e23-b864-44aecfe282e1","concept":{"name":"set"},"type":"field","tags":["lights"],"content":{"type":"list","readonly":false,"disabled":false,"list":{"item":{"template":{"tag":"","name":""},"style":{"css":["tl-light-set__list-item"]}},"style":{"css":["tl-light-set__list"]}},"action":{"add":{"position":"before","help":"Add a light","content":[{"type":"static","static":{"type":"image","url":"https://cdn3.vectorstock.com/i/1000x1000/86/82/traffic-light-icon-vector-21088682.jpg","style":{"css":["label-icon"]}}},{"type":"static","static":{"type":"text","content":"New light"}}],"style":{"css":["tl-light-set__btn-add"]}},"remove":{"content":[{"type":"static","static":{"type":"text","content":"✖"}}],"style":{"css":["tl-light-set__btn-remove"]}}},"style":{"css":["tl-light-set"],"gss":{"box":{"inner":{"top":{"value":8,"unit":"px"},"right":{"value":6,"unit":"px"},"bottom":{"value":8,"unit":"px"},"left":{"value":6,"unit":"px"}}}}}}},{"id":"c5sl4988-0978-48c8-57b6-a50po9fe4c9f","concept":{"name":"string"},"type":"layout","tags":["readonly"],"content":{"type":"wrap","disposition":[{"type":"static","static":{"type":"text","content":{"type":"property","name":"value","style":{"css":["tl-name-reference__value"]}}}}],"style":{"css":["tl-name-reference"]}}},{"id":"c5sl4988-0978-48c8-57b6-a50po9fe4c9f","concept":{"name":"string"},"type":"layout","tags":["readonly-color"],"content":{"type":"wrap","disposition":[],"style":{"css":["tl-icon","tl-icon--light"],"html":[{"name":"color","value":{"type":"property","name":"value"}}]}}},{"id":"c5sl4988-0978-48c8-57b6-a50po9fe4c9f","concept":{"name":"string"},"type":"layout","tags":["color-label"],"content":{"type":"wrap","disposition":[{"type":"static","static":{"type":"text","content":"Color:","style":{"ref":["label"]}}},{"type":"field","field":{"type":"text","readonly":false,"disabled":false,"multiline":false,"resizable":true,"input":{"type":"text","placeholder":"color","style":{"css":["tl-color-textbox__input"]}},"style":{"css":["tl-color-textbox"]}}}],"style":{"css":["tl-color-label-textbox"]}}},{"id":"aeee0728-503b-404b-9123-8a4b07e87703","concept":{"name":"string"},"type":"field","tags":["name"],"content":{"type":"text","readonly":false,"disabled":false,"multiline":false,"resizable":true,"input":{"type":"text","placeholder":"name","style":{"css":["tl-textbox__input"]}},"style":{"css":["tl-textbox"]}}},{"id":"c5sll288-0978-48c8-57b6-a50po9fe4c9f","concept":{"name":"string"},"type":"layout","tags":["name-label"],"content":{"type":"wrap","disposition":[{"type":"static","static":{"type":"text","content":"Name:","style":{"ref":["label"]}}},{"type":"field","field":{"type":"text","readonly":false,"disabled":false,"multiline":false,"resizable":true,"input":{"type":"text","placeholder":"name","style":{"css":["tl-textbox__input"]}},"style":{"css":["tl-textbox"]}}}],"style":{"css":["tl-label-textbox"]}}},{"id":"aeee0728-503b-485b-9123-8a4b07e87703","concept":{"name":"string"},"type":"field","tags":["name-deco"],"content":{"type":"text","readonly":false,"disabled":false,"multiline":false,"resizable":true,"input":{"type":"text","placeholder":"name","style":{"css":["tl-parenthese-textbox__input"]}},"style":{"css":["tl-parenthese-textbox"]}}},{"id":"aer51728-50i1-404b-9104-84bg078h7733","concept":{"name":"string"},"type":"field","tags":["color"],"content":{"type":"text","readonly":false,"disabled":false,"multiline":false,"resizable":true,"input":{"type":"text","placeholder":"color","style":{"css":["tl-color-textbox__input"]}},"style":{"css":["tl-color-textbox"]}}},{"id":"rhd39728-556b-404b-1440-f7l0g308a783","concept":{"name":"string"},"tags":["simple-string"],"type":"field","content":{"type":"text","resizable":true,"input":{"placeholder":"null","style":{"css":["tl-textbox__input"]}},"style":{"css":["tl-textbox"]}}},{"id":"rhdo9728-503b-404b-1440-8a78f7l030k3","concept":{"name":"number"},"tags":["textual"],"type":"field","content":{"type":"text","resizable":true,"input":{"placeholder":"time","style":{"css":["tl-textbox__input"]}},"style":{"css":["tl-textbox"]}}},{"id":"rhdo9728-503b-404b-9114-8a240c787l03","concept":{"name":"reference"},"type":"field","tags":["state-reference"],"content":{"type":"choice","choice":{"option":{"template":{"tag":"choice"},"style":{"css":["state-reference__choice-option"]}},"style":{"css":["state-reference__choice"]}},"placeholder":"state target","expanded":false,"input":{"placeholder":"Filter the states"},"style":{"css":["state-reference"],"gss":{"text":{"color":{"value":"#333","type":"hex"}}}}}},{"id":"c5sll288-0978-f48g-356r-50ad1cpo9fef","concept":{"name":"reference"},"type":"layout","tags":["state-label-reference"],"content":{"type":"wrap","disposition":[{"type":"static","static":{"type":"text","content":"Initial Light:","style":{"ref":["label"]}}},{"type":"field","field":{"type":"choice","choice":{"option":{"template":{"tag":"choice"},"style":{"css":["state-reference__choice-option"]}},"style":{"css":["state-reference__choice"]}},"placeholder":"no selection","expanded":false,"input":{"placeholder":"Filter the states"},"style":{"css":["state-reference"],"ref":["box-left"],"gss":{"text":{"color":{"value":"#333","type":"hex"}}}}}}],"style":{"css":["state-label-reference"]}}}]}')}},t={};function a(s){if(t[s])return t[s].exports;var i=t[s]={exports:{}};return e[s](i,i.exports,a),i.exports}a.d=(e,t)=>{for(var s in t)a.o(t,s)&&!a.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var s={};return(()=>{a.r(s),a.d(s,{Model:()=>t});const e=a(607),t={concept:a(832),editor:e,projection:a(523)}})(),s})()}));