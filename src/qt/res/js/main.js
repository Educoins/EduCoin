// EduCoin HTML5 main.js

$("[href='#qrcode-modal']").leanModal({top : 10, overlay : 0.5, closeButton: "#qrcode-modal .modal_close"});
$("#start-conversation").leanModal({top : 200, overlay : 0.5, closeButton: "#new-contact-modal .modal_close"});
$("#add-new-address").leanModal({top : 200, overlay : 0.5, closeButton: "#add-address-modal .modal_close"});
$("#add-new-send-address").leanModal({top : 200, overlay : 0.5, closeButton: "#add-address-modal .modal_close"});
$("#sign-addlkp-btn").leanModal({  top : 110, overlay : 1,  zindex:11001, closeButton: "#address-lookup-modal .modal_close", childPopup: true});
$("#verify-addlkp-btn").leanModal({ top : 110, overlay : 1, zindex:11001, closeButton: "#address-lookup-modal .modal_close", childPopup: true});
$("#verify-message-button").leanModal({top : 50, overlay : 0.5, closeButton: "#verify-sign-modal .modal_close"});
$("#sign-message-button").leanModal({top : 50, overlay : 0.5, closeButton: "#verify-sign-modal .modal_close"});
$("#import-key-button").leanModal({top : 50, overlay : 0.5, closeButton: "#import-key-modal .modal_close"});


var qrcode = new QRCode("qrcode", {colorDark:'#6C8C3C', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H, width: 220, height: 220,});

function showQRCode(address, label) {

    if(address!=undefined)
        $("#qraddress").val(address);

    if(label!=undefined)
        $("#qrlabel").val(label);

    qrcode.clear();

    var textarea = $("#qrcode-data"),
        data = "EduCoin:";

    data += $("#qraddress").val()
          + "?label="     + $("#qrlabel").val()
          + "&narration=" + $("#qrnarration").val()
          + "&amount=" + unit.parse($("#qramount").val(), $("#qrunit").val());

    textarea.text(data);

    qrcode.makeCode(data);
}

var breakpoint = 906, // 56.625em
    footer = $("#footer");

function resizeFooter() {
    $(".ui-buttons").each(function() {
        $(this).css("margin-top", Math.max($("body").height() - ($(this).offset().top + $(this).height()) -65 + parseInt($(this).css("margin-top")), 10) + "px");
    });

    footer.height(Math.max($("body").height() - footer.offset().top, 35) + "px");
};

function updateValue(element) {
    var curhtml = element.html(),
        value   = (element.parent("td").data("label") != undefined ? element.parent("td").data("label") :
                  (element.parent("td").data("value") != undefined ? element.parent("td").data("value") :
                  (element             .data("label") != undefined ? element             .data("label") :
                  (element             .data("value") != undefined ? element             .data("value") : element.text()))));

    var address = element.parents(".selected").find(".address");

    address = address.data("value") ? address.data("value") : address.text();

    element.html('<input class="newval" type="text" onchange="bridge.updateAddressLabel(\'' + address + '\', this.value);" value="' + value + '" size=60 />');

    $(".newval").focus();
    $(".newval").on("contextmenu", function(e) {
        e.stopPropagation();
    });
    $(".newval").keyup(function (event) {
        if (event.keyCode == 13)
            element.html(curhtml.replace(value, $(".newval").val().trim()))
    });

    $(document).one('click', function () {
        element.html(curhtml.replace(value, $(".newval").val().trim()));
    });
}

$(function() {
    // Menu icon onclick
    $("#navlink").on("click", function() {
        $("#layout").toggleClass('active');
    });

    $("#qramount").on("keydown", unit.keydown).on("paste", unit.paste);


    $('.footable').footable({breakpoints:{phone:480, tablet:700}, delay: 50})
    .on({'footable_breakpoint': function() {
            //$('table').trigger('footable_expand_first_row'); uncomment if we want the first row to auto-expand
        },
        'footable_redrawn':  resizeFooter,
        'footable_resized':  resizeFooter,
        'footable_filtered': resizeFooter,
        'footable_paging':   resizeFooter,
        'footable_row_expanded': function(event) {
        var editable = $(this).find(".editable");

        editable.off("dblclick");
        editable.on("dblclick", function (event) {
           event.stopPropagation();
           updateValue($(this));
        }).attr("data-title", "Double click to edit").on('mouseenter', tooltip);
    }});

    $(".editable").on("dblclick", function (event) {
       event.stopPropagation();
       updateValue($(this));
    }).attr("data-title", "Double click to edit %column%");

    $(document).ready(function() {
        resizeFooter();
        $("#navitems a[href='#overview']").trigger('click');
    });

    //$('img,i').click(function(e){e.stopPropagation()});

    // On resize, close menu when it gets to the breakpoint
    window.onresize = function (event) {
        if (window.innerWidth > breakpoint)
            $("#layout").removeClass('active');

        resizeFooter();
    };

    // Change page handler
    $("#navitems a").on("click", changePage);

    if(bridge)
        $("[href='#about']").on("click", function() {bridge.userAction(['aboutClicked'])});

    overviewPage.init();
    sendPageInit();
    receivePageInit();
    transactionPageInit();
    addressBookInit();
    chatInit();
    keyManagementPage.init();
    // Tooltip
    $('[data-title]').on('mouseenter', tooltip);

    $(".footable tr").on('click', function() {
        $(this).addClass("selected").siblings("tr").removeClass("selected");
    });
});

var prevPage = null;

function changePage(event) {
    var toPage = $($(this).attr('href'));

    prevPage = $("#navitems li.selected a");

    $("#navitems li").removeClass("selected");
    $(this).parent("li").addClass("selected");

    if(toPage.length == 1 && toPage[0].tagName.toLowerCase() == "article") {
        event.preventDefault();
        $(window).scrollTop(0);
        $("article").hide();
        toPage.show();
        $(document).resize();
    }
}

function tooltip (event) {
    var target  = false,
        tooltip = false,
        tip     = false;

    if($("input, textarea").is(':focus') || $('.iw-contextMenu').css('display') == 'inline-block')
        return;

    event.stopPropagation();

    $("#tooltip").click();

    target  = $(this);
    tip     = target.attr('data-title');
    tooltip = $('<div id="tooltip"></div>');
    
    if(!tip || tip == '')
        return false;

    tip = tip.replace(/&#013;|\n|\x0A/g, '<br />')

    .replace(/%column%/g, function() {
        return $(target.parents("table").find("thead tr th")[target[0].cellIndex]).text();
    }).replace(/%([.\w\-]+),([.\w\-]+)%/g, function($0, $1, $2){
        return target.children($1).attr($2);
    }).replace(/%([.\w\-]+)%/g, function($0, $1){
        return target.children($1).text();
    });

    tooltip.css('opacity', 0)
           .html(tip)
           .appendTo('body');

    if(target.css('cursor') != "pointer" && target.prop("tagName") != "A")
        target.css('cursor', 'help');

    var init_tooltip = function() {
        if($(window).width() < tooltip.outerWidth() * 1.5)
            tooltip.css('max-width', $(window).width() / 2);
        else
            tooltip.css('max-width', 340);

        var pos_left = target.offset().left + (target.outerWidth() / 2) - (tooltip.outerWidth() / 2),
            pos_top  = target.offset().top - tooltip.outerHeight() - 20;

        if(pos_left < 0)
        {
            pos_left = target.offset().left + target.outerWidth() / 2 - 20;
            tooltip.addClass('left');
        }
        else
            tooltip.removeClass('left');

        if(pos_left + tooltip.outerWidth() > $(document).width())
        {
            pos_left = target.offset().left - tooltip.outerWidth() + target.outerWidth() / 2 + 13;
            tooltip.addClass('right');
        }
        else
            tooltip.removeClass('right');

        if(pos_left + target.outerWidth() > $(document).width())
        {
            pos_left = event.pageX;
            tooltip.removeClass('left right');
        }

        if(pos_top < 0)
        {
            var pos_top = target.offset().top + target.outerHeight();
            tooltip.addClass('top');
        }
        else
            tooltip.removeClass('top');

        tooltip.css({left: pos_left, top: pos_top})
               .animate({top: '+=10', opacity: 1}, 100);
    };

    init_tooltip();
    $(window).resize(init_tooltip);

    var remove_tooltip = function()
    {
        tooltip.animate({top: '-=10', opacity: 0}, 100, function() {
            $(this).remove();
        });
    };

    target.on('mouseleave', remove_tooltip);
    target.on('contextmenu', remove_tooltip);
    tooltip.on('click', remove_tooltip);
}


function connectSignals() {
    bridge.emitPaste.connect(this, pasteValue);

    bridge.emitTransactions.connect(this, appendTransactions);
    bridge.emitAddresses.connect(this, appendAddresses);
    bridge.emitMessages.connect(this, appendMessages);
    bridge.emitMessage.connect(this,  appendMessage);

    bridge.emitCoinControlUpdate.connect(this, updateCoinControlInfo);

    bridge.emitAddressBookReturn.connect(this, addressBookReturn);

    bridge.triggerElement.connect(this, triggerElement);

    bridge.emitReceipient.connect(this, addRecipientDetail);
    bridge.networkAlert.connect(this, networkAlert);

    optionsModel.displayUnitChanged.connect(unit, "setType");
    optionsModel.reserveBalanceChanged.connect(overviewPage, "updateReserved");
    optionsModel.rowsPerPageChanged.connect(this, "updateRowsPerPage");
    optionsModel.visibleTransactionsChanged.connect(this, "visibleTransactions");

    walletModel.encryptionStatusChanged.connect(overviewPage, "encryptionStatusChanged");
    walletModel.balanceChanged.connect(overviewPage, "updateBalance");

    overviewPage.clientInfo();
    optionsPage.update();
}

function triggerElement(el, trigger) {
    $(el).trigger(trigger);
}

function updateRowsPerPage(rows) {
    $(".footable").each(function() {
        $(this).data().pageSize = rows;
        $(this).trigger('footable_initialize');
    });
}

var base58 = {
    base58Chars :"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",

    check: function(field)
    {
        var el = $(field);
        var value = el.val();

        for (var i = 0, len = value.length; i < len; ++i)
            if (base58.base58Chars.indexOf(value[i]) == -1) {
                el.css("background", "#6C8C3C").css("color", "white");
                return false;
            }

        el.css("background", "").css("color", "");
        return true;
    }
}

var addressLookup = "",
    addressLabel  = "";

function openAddressBook(field, label, sending)
{
    addressLookup = field;
    addressLabel  = label;

    bridge.openAddressBook(sending);
}

function addressBookReturn(address, label)
{
    $(addressLookup).val(address).change();
    $(addressLabel) .val(label)  .change();
}

var pasteTo = "";

function pasteValue(value) {
    $(pasteTo).val(value);
}

function paste(field)
{
    pasteTo = field;
    bridge.paste();
    if (pasteTo.indexOf("#pay_to") == 0
        || pasteTo == '#change_address')
        base58.check(pasteTo);
}

function copy(field, attribute)
{
    var value = '';

    try {
        value = $(field).text();
    } catch(e) {};

    if(value==undefined||attribute!=undefined)
    {
        if(attribute=='copy')
            value = field;
        else
            value = $(field).attr(attribute);
    }

    bridge.copy(value);
}

function networkAlert(alert) {
    $("#network-alert span").text(alert);

    if(alert == "")
        $("#network-alert").hide();
    else
        $("#network-alert").show();
}

var unit = {
    type: 0,
    name: "EDU",
    display: "EDU",
    setType: function(type) {
        this.type = (type == undefined ? 0 : type);

        switch(type) {
            case 1:
                this.name = "mEDU",
                this.display = "mEDU";
                break;

            case 2:
                this.name = "uEDU",
                this.display = "&micro;EDU";
                break;

            case 3:
                this.name    = "sEDU",
                this.display = "Shi-EduCoins";
                break;

            default:
                this.name = this.display = "EDU";
        }

        $("td.unit,span.unit,div.unit").html(this.display);
        $("select.unit").val(type).trigger("change");
        $("input.unit").val(this.name);
        overviewPage.updateBalance();
    },
    format: function(value, type) {
        var el = ($.isNumeric(value) ? null : $(value));

        type  = (type == undefined ? this.type : parseInt(type)),
        value = parseInt(el == undefined ? value : (el.data('value') == undefined ? el.val() : el.data('value')));

        switch(type) {
            case 1: value = value / 100000; break;
            case 2: value = value / 100; break;
            case 3: break;
            default: value = value / 100000000;
        }

        value = value.toFixed(this.mask(type));

        if(el == undefined)
            return value;

        el.val(value);
    },
    parse: function(value, type) {
        var el = ($.isNumeric(value) ? null : $(value));

        type  = (type == undefined ? this.type : parseInt(type)),

        fp = (el == undefined ? value : el.val());
        if (fp == undefined || fp.length < 1)
            fp = ['0', '0'];
        else
        if (fp[0] == '.')
            fp = ['0', fp.slice(1)];
        else
            fp = fp.split('.');

        value = parseInt(fp[0]);

        var ipow = this.mask(type);
        if (ipow > 0)
            value *= Math.pow(10, ipow);
        if (ipow > 0 && fp.length > 1)
        {
            var av = fp[1].split('');

            while (av.length > 1 && av[av.length-1] == '0')
                av.pop();

            var fract = parseInt(av.join(''));

            if (fract > 0)
            {
                ipow -= av.length;

                if (ipow > 0)
                    fract = fract * Math.pow(10, ipow);
                value += fract
            };
        };

        if (el == undefined)
            return value;

        el.data('value', value);
        this.format(el, type);
    },
    mask: function(type) {
        type  = (type == undefined ? this.type : parseInt(type));

        switch(type) {
            case 1: return 5;
            case 2: return 2;
            case 3: return 0;
            default:return 8;
        }
    },
    keydown: function(e) {
        var key = e.which,
            type = $(e.target).siblings(".unit").val();


        if(key==190 || key == 110) {
            if(this.value.toString().indexOf('.') != -1 || unit.mask(type) == 0)
                e.preventDefault();

            return true;
        }

        if(!e.shiftKey && (key>=96 && key<=105 || key>=48 && key<=57)) {
            var selectS = this.selectionStart;
            var indP = this.value.indexOf(".");
            if (!(document.getSelection().type == "Range") && selectS > indP && this.value.indexOf('.') != -1 && this.value.length -1 - indP >= unit.mask(type))
            {
                if (this.value[this.value.length-1] == '0'
                    && selectS < this.value.length)
                {
                    this.value = this.value.slice(0,-1);
                    this.selectionStart = selectS;
                    this.selectionEnd = selectS;
                    return;
                }
                e.preventDefault();
            }
            return;
        }

        if(key==8||key==9||key == 17||key==46||key==45||key>=35 && key<=40||(e.ctrlKey && (key==65||key==67||key==86||key==88)))
            return;

        e.preventDefault();
    },
    paste: function(e) {
        var data = e.originalEvent.clipboardData.getData("text/plain");
        if(!($.isNumeric(data)) || (this.value.indexOf('.') != -1 && document.getSelection().type != "Range"))
            e.preventDefault();
    }
};

var contextMenus = [];
function openContextMenu(el)
{
    if (contextMenus.indexOf(el) == -1)
        contextMenus.push(el);

    if (el.isOpen != undefined && el.isOpen == 1)
    {
        el.isOpen = 0;
        if(el.close)
            el.close();
    }

    // -- close other menus (their onClose isn't called if they were closed by opening another memu)
    for (var i = 0; i < contextMenus.length; ++i)
        contextMenus[i].isOpen = contextMenus[i] == el ? 1 : 0;
}

/* Overview Page */
var overviewPage = {
    init: function() {
        this.balance = $(".balance"),
        this.tokenBal = $(".token_balance"),
        this.reserved = $("#reserved"),
        this.stake = $("#stake"),
        this.unconfirmed = $("#unconfirmed"),
        this.immature = $("#immature"),
        this.total = $("#total");

        var menu = [{
                name: 'Backup&nbsp;Wallet...',
                fa: 'fa-save vred fa-fw font-20px',
                fun: function () {
                   bridge.userAction(['backupWallet']);
                }
                }, /*
                {
                    name: 'Export...',
                    img: 'qrc:///icons/editcopy',
                    fun: function () {
                        copy('#addressbook .footable .selected .label');
                    }
                }, */
                {
                    name: 'Sign&nbsp;Message...',
                    fa: 'fa-pencil-square-o vred fa-fw font-20px',
                    fun: function () {

                       $('#sign-message-button').click();
                    }
                },
                {
                    name: 'Verify&nbsp;Message...',
                    fa: 'fa-check vred fa-fw font-20px',
                    fun: function () {
                        $('#verify-message-button').click();
                    }
                },
                {
                    name: 'Exit',
                    fa: 'fa-times vred fa-fw font-20px',
                    fun: function () {
                       bridge.userAction(['close']);
                    }
                }];

        $('#file').contextMenu(menu, {onOpen:function(data,e){openContextMenu(data.menu);}, onClose:function(data,e){data.menu.isOpen = 0;}, triggerOn: 'click', displayAround: 'trigger', position: 'bottom', mouseClick: 'left', sizeStyle: 'content'});

        menu = [{
                     id: 'encryptWallet',
                     name: 'Encrypt&nbsp;Wallet...',
                     fa: 'fa-lock vred fa-fw font-20px',
                     fun: function () {
                        bridge.userAction(['encryptWallet']);
                     }
                 },
                 {
                     id: 'changePassphrase',
                     name: 'Change&nbsp;Passphrase...',
                     fa: 'fa-key vred fa-fw font-20px',
                     fun: function () {
                        bridge.userAction(['changePassphrase']);
                     }
                 },
                 {
                     id: 'toggleLock',
                     name: 'Toggle&nbsp;Lock...',
                     fa: 'fa-unlock vred pad fa-fw font-20px',
                     fun: function () {
                        bridge.userAction(['toggleLock']);
                     }
                 },
                 {
                     name: 'Key Management',
                     fa: 'fa-keyboard-o vred fa-fw font-20px',
                     fun: function () {
                        $("#navitems [href=#keymanagement]").click();
                     }                                                                                                                                
                 },
                 {
                     name: 'Options',
                     fa: 'fa-wrench vred fa-fw font-20px',
                     fun: function () {
                        $("#navitems [href=#options]").click();
                     }
                 }];

        $('#settings').contextMenu(menu, {onOpen:function(data,e){openContextMenu(data.menu);}, onClose:function(data,e){data.menu.isOpen = 0;}, triggerOn: 'click', displayAround: 'trigger', position: 'bottom', mouseClick: 'left', sizeStyle: 'content'});

        menu = [{
                     name: 'Debug&nbsp;Window...',
                     fa: 'fa-bug vred fa-fw font-20px',
                     fun: function () {
                        bridge.userAction(['debugClicked']);
                     }
                 },
                 {
                     name: ' About&nbsp;EduCoin...',
                     img: 'qrc:///icons/EduCoin-16',
                     fun: function () {
                        bridge.userAction(['aboutClicked']);
                     }
                 },
                 {
                     name: 'About&nbsp;Qt...',
                     fa: 'fa-question vred fa-fw font-20px',
                     fun: function () {
                        bridge.userAction(['aboutQtClicked']);
                     }
                 }];

        $('#help').contextMenu(menu, {onOpen:function(data,e){openContextMenu(data.menu);}, onClose:function(data,e){data.menu.isOpen = 0;}, triggerOn: 'click', displayAround: 'trigger', position: 'bottom', mouseClick: 'left', sizeStyle: 'content'});
    },

    updateBalance: function(balance, tokenBal, stake, unconfirmed, immature) {
        if(balance == undefined)
            balance     = this.balance    .data("orig"),
            tokenBal    = this.tokenBal   .data("orig"),
            stake       = this.stake      .data("orig"),
            unconfirmed = this.unconfirmed.data("orig"),
            immature    = this.immature   .data("orig");
        else
            this.balance    .data("orig", balance),
            this.tokenBal   .data("orig", tokenBal),
            this.stake      .data("orig", stake),
            this.unconfirmed.data("orig", unconfirmed),
            this.immature   .data("orig", immature);

        this.formatValue("balance",     balance);
        this.formatValue("tokenBal",   tokenBal);
        this.formatValue("stake",       stake);
        this.formatValue("unconfirmed", unconfirmed);
        this.formatValue("immature",    immature);
        this.formatValue("total", balance + stake + unconfirmed + immature);
        resizeFooter();
    },

    updateReserved: function(reserved) {
        this.formatValue("reserved", reserved);
    },

    formatValue: function(field, value) {

        if(field == "total" && value != undefined && !isNaN(value))
        {
            var val = unit.format(value).split(".");

            $("#total-big > span:first-child").text(val[0]);
            $("#total-big .cents").text(val[1]);
        }

        if(field == "stake" && value != undefined && !isNaN(value))
        {
            if(value == 0)
                $("#staking-big").addClass("not-staking");
            else
                $("#staking-big").removeClass("not-staking");

            var val = unit.format(value).split(".");

            $("#staking-big > span:first-child").text(val[0]);
            $("#staking-big .cents").text(val[1]);
        }

        field = this[field];

        if(value == 0) {
            field.html("");
            field.parent("tr").hide();
        } else {
            field.text(unit.format(value));
            field.parent("tr").show();
        }
    },
    recent: function(transactions) {
        for(var i = 0;i < transactions.length;i++)
            overviewPage.updateTransaction(transactions[i]);

        $("#recenttxns [data-title]").off("mouseenter").on("mouseenter", tooltip)
    },
    updateTransaction: function(txn) {
        var format = function(tx) {

            return "<a id='"+tx.id.substring(0,17)+"' data-title='"+tx.tt+"' class='transaction-overview' href='#' onclick='$(\"#navitems [href=#transactions]\").click();$(\"#"+tx.id+"\").click();'>\
                                                <span class='"+(tx.t == 'input' ? 'received' : (tx.t == 'output' ? 'sent' : (tx.t == 'inout' ? 'self' : 'stake')))+" icon no-padding'>\
                                                  <i class='fa fa-"+(tx.t == 'input' ? 'angle-left' : (tx.t == 'output' ? 'angle-right' : (tx.t == 'inout' ? 'angle-down' : 'money')))+" font-26px margin-right-10'></i>"
                                                +unit.format(tx.am)+" </span> <span> "+unit.display+" </span> <span class='overview_date' data-value='"+tx.d+"'>"+tx.d_s+"</span></a>";

        }

        var sid = txn.id.substring(0,17);

        if($("#"+sid).attr("data-title", txn.tt).length==0)
        {
            var set = $('#recenttxns a');
            var txnHtml = format(txn);

            var appended = false;

            for(var i = 0; i<set.length;i++)
            {
                var el = $(set[i]);

                if (parseInt(txn.d) > parseInt(el.find('.overview_date').data("value")))
                {
                    el.before(txnHtml);
                    appended = true;
                    break;
                }
            }

            if(!appended)
                $("#recenttxns").append(txnHtml);

            set = $('#recenttxns a');

            while(set.length > 7)
            {
                $("#recenttxns a:last").remove();

                set = $('#recenttxns a');
            }
        }

        /*
        if (set.length == 0)
        {
            $("#recenttxns").append(format(txn));

            //return;
        }

        var sid = txn.id.substring(0,17);

        set.each(function(index) {
            var el = $(this);
            console.log(index);
            if (txn.date > el.find('.overview_date').attr("data-value"))
                el.before(format(txn));
            else
                el.after(format(txn));

            if (set.length >= 7)
                $("#recenttxns a:last").remove();

            return;
        });*/
    },
    clientInfo: function() {
        $('#version').text(bridge.info.build.replace(/\-[\w\d]*$/, ''));
    },
    encryptionStatusChanged: function(status) {
        switch(status)
        {
        case 0: // Not Encrypted
        case 1: // Unlocked
        case 2: // Locked
        }
    }
}

var optionsPage = {
    init: function() {
    },

    update: function() {
        var options = bridge.info.options;
        $("#options-ok,#options-apply").addClass("disabled");

        for(var option in options)
        {
            var element = $("#opt"+option),
                value   = options[option],
                values  = options["opt"+option];

            if(element.length == 0)
            {
                if(option.indexOf('opt') == -1)
                    console.log('Option element not available for %s', option);

                continue;
            }

            if(values)
            {
                element.html("");

                for(var prop in values)
                    if(typeof prop == "string" && $.isArray(values[prop]) && !$.isNumeric(prop))
                    {
                        element.append("<optgroup label='"+prop[0].toUpperCase() + prop.slice(1)+"'>");

                        for(var i=0;i<values[prop].length;i++)
                            element.append("<option>" + values[prop][i] + "</option>");
                    } else
                        element.append("<option" + ($.isNumeric(prop) ? '' : " value='"+prop+"'") + ">" + values[prop] + "</option>");
            }

            function toggleLinked(el) {
                el = $(this);
                var enabled = el.prop("checked"),
                    linked = el.data("linked");

                if(linked)
                    linked = linked.split(" ");
                else
                    return;

                for(var i=0;i<linked.length;i++)
                {
                    var linkedElements = $("#"+linked[i]+",[for="+linked[i]+"]").attr("disabled", !enabled);
                    if(enabled)
                        linkedElements.removeClass("disabled");
                    else
                        linkedElements.addClass("disabled");
                }
            }

            if(element.is(":checkbox"))
            {
                element.prop("checked", value == true||value == "true");
                element.off("change");
                element.on("change", toggleLinked);
                element.change();
            }
            else if(element.is("select[multiple]") && value == "*")
                element.find("option").attr("selected", true);
            else
                element.val(value);

            element.one("change", function() {$("#options-ok,#options-apply").removeClass("disabled");});
        }
    },
    save: function() {
        var options = bridge.info.options,
            changed = {};

        for(var option in options)
        {
            var element  = $("#opt"+option),
                oldvalue = options[option],
                newvalue = false;

            if(oldvalue == null || oldvalue == "false")
                oldvalue = false;

            if(element.length == 0)
                continue;

            if(element.is(":checkbox"))
                newvalue = element.prop("checked");
            else if(element.is("select[multiple]") && element.find("option:not(:selected)").length == 0)
                newvalue = "*";
            else
                newvalue = element.val();

            if(oldvalue != newvalue && oldvalue.toString() != newvalue.toString())
                changed[option] = newvalue;
        }

        if(!$.isEmptyObject(changed))
        {
            bridge.userAction({'optionsChanged': changed});
            optionsPage.update();

            if(changed.hasOwnProperty('AutoRingSize'))
                changeTxnType();
        }
    }
}

/* Send Page */
function sendPageInit() {
    toggleCoinControl(); // TODO: Send correct option value...
    addRecipient();
    changeTxnType();
    $("#cust-add-lkp").leanModal({top : 200, overlay : 0.5, closeButton: "#address-lookup-modal .modal_close"});
}

var recipients = 0;
var returnto = "";
function addRecipient() {

    $("#recipients").append((
           (recipients == 0 || $("div.recipient").length == 0 ? '' : '<hr />')
        +  '<div id="recipient[count]" class="recipient"> \
            <div class="flex-right"> \
                <label for="pay_to[count]" class="recipient">Pay To:</label> \
                <input id="pay_to[count]" class="pay_to input_box" data-title="The address to send the payment to  (e.g. EYh6PCshUh3TjsHziEAhUYVwxisisH3fnS)" placeholder="Enter a EduCoin address (e.g. EYh6PCshUh3TjsHziEAhUYVwxisisH3fnS)" maxlength="128" oninput="base58.check(this);" onchange="$(\'#label[count]\').val(bridge.getAddressLabel(this.value));"/> \
                <a id="address_lookup[count]" class="button is-inverse has-fixed-icon" data-title="Choose from address book" style="margin-right:10px; margin-left:10px; height:43px; width:43px;" href="#address-lookup-modal" onclick="returnto=\'pay_to[count]\,label[count]\';prepAddressLookup(false); " ><i class="fa fa-book"></i></a> \
                <a class="button is-inverse has-fixed-icon" data-title="Paste address from clipboard" style="margin-right:10px; height:43px; width:43px;" onclick="paste(\'#pay_to[count]\')"><i class="fa fa-files-o"></i></a> \
                <a class="button is-inverse has-fixed-icon" data-title="Remove this recipient" style="height:43px; width:43px;" onclick="if($(\'div.recipient\').length == 1) clearRecipients(); else {var recipient=$(\'#recipient[count]\');if(recipient.next(\'hr\').remove().length==0)recipient.prev(\'hr\').remove();$(\'#recipient[count]\').remove();resizeFooter();}"><i class="fa fa-times"></i></a> \
            </div> \
            <div class="flex-right"> \
                <label for="label[count]" class="recipient">Label:</label> \
                <input id="label[count]" class="label input_box" data-title="Enter a label for this address to add it to your address book" placeholder="Enter a label for this address to add it to your address book" maxlength="128"/> \
            </div> \
            <div class="flex-right"> \
                <label for="narration[count]" class="recipient">Narration:</label> \
                <input id="narration[count]" class="narration input_box" data-title="Enter a short note to send with payment (max 24 characters)" placeholder="Enter a short note to send with a payment (max 24 characters)" maxlength="24" /> \
            </div> \
            <div class="flex-left"> \
                <label for="amount[count]" class="recipient">Amount:</label> \
                <input id="amount[count]" class="amount input_box" type="number" placeholder="0.00000000" step="0.01" value="0.00000000" onfocus="invalid($(this), true);" onchange="unit.parse(this, $(\'#unit[count]\').val());updateCoinControl();"  /> \
                <select id="unit[count]" class="unit button is-inverse has-fixed-icon"  style="margin-left:10px; height:43px; width:100px;" onchange="unit.format(\'#amount[count]\', $(this).val());"> \
                    <option value="0" title="EduCoin"                    ' + (unit.type == 0 ? "selected" : "") + '>EDU</option> \
                    <option value="1" title="Milli-EduCoin (1 / 1000)"   ' + (unit.type == 1 ? "selected" : "") + '>mEDU</option> \
                    <option value="2" title="Micro-EduCoin (1 / 1000000)"' + (unit.type == 2 ? "selected" : "") + '>&micro;EDU</option> \
                    <option value="3" title="Shi-EduCoins (1 / 100000000)" ' + (unit.type == 3 ? "selected" : "") + '>sEDU</option> \
                </select> \
            </div> \
        </div>').replace(/\[count\]/g, recipients++));
        resizeFooter();

        // Don't allow characters in numeric fields
        $("#amount"+(recipients-1).toString()).on("keydown", unit.keydown).on("paste",  unit.paste);

        $("#address_lookup"+(recipients-1)).leanModal({top : 200, overlay : 0.5, closeButton: "#address-lookup-modal .modal_close"});

        // Addressbook Modal
        $("#addressbook"+(recipients-1).toString()).leanModal({ top : 10, left: 5, overlay : 0.5, closeButton: ".modal_close" });

    bridge.userAction(['clearRecipients']);
}

function clearRecipients() {
    $("#recipients").html("");
    recipients = 0;
    addRecipient();
    resizeFooter();
    returnto = "";
}

function addRecipientDetail(address, label, narration, amount) {
    var recipient = recipients - 1;

    $("#pay_to"+recipient).val(address).change();
    $("#label"+recipient).val(label).change();
    $("#narration"+recipient).val(narration).change();
    $("#amount"+recipient).val(amount).change();
}

function changeTxnType()
{
    var type=$("#txn_type").val();

    if (type > 1)
    {
        $("#tx_ringsize,#suggest_ring_size")[bridge.info.options.AutoRingSize == true ? 'hide' : 'show']();
        $("#coincontrol,#spend_vtr").hide();
        $("#spend_token").show();
        toggleCoinControl(false);
    }
    else
    {
        $("#tx_ringsize,#suggest_ring_size,#spend_token").hide();
        $("#coincontrol,#spend_vtr").show();
    }

    resizeFooter();
}

function suggestRingSize()
{
    var minsize = bridge.info.options.MinRingSize||3,
        maxsize = bridge.info.options.MaxRingSize||50;

    function mature(value, min_owned) {
        if(min_owned == undefined || !$.isNumeric(min_owned))
            min_owned = 1;

        if(anonOutput)
            return Math.min(anonOutput
               && anonOutput.owned_mature  >= min_owned
               && anonOutput.system_mature >= minsize
               && anonOutput.system_mature, maxsize);
        else
            return 0;
    }

    function getOutputRingSize(output, test, maxsize)
    {
        switch (output)
        {
            case 0:
                return maxsize;
            case 2:
                return mature(1*test, 2)||getOutputRingSize(++output, test, maxsize);
            case 6:
                return Math.min(mature(5*test, 1),
                                mature(1*test, 1))||getOutputRingSize(++output, test, maxsize);
            case 7:
                return Math.min(mature(4*test, 1),
                                mature(3*test, 1))||getOutputRingSize(++output, test, maxsize);
            case 8:
                return Math.min(mature(5*test, 1),
                                mature(3*test, 1))||getOutputRingSize(++output, test, maxsize);
            case 9:
                return Math.min(mature(5*test, 1),
                                mature(4*test, 1))||getOutputRingSize(++output, test, maxsize);
            default:
                if(output == 10)
                    return mature(test/2, 2);

                maxsize = Math.max(mature(output*test, 1),mature(1*test, output))||getOutputRingSize(output==1?3:++output, test, maxsize);
        }
        return maxsize;
    }

    for(var i=0;i<recipients;i++)
    {
        var test = 1,
            output = 0,
            el = $("#amount"+i),
            amount = unit.parse(el.val(), $("#unit"+i));

        $("[name=err"+el.attr('id')+"]").remove();

        while (amount >= test && maxsize >= minsize)
        {
            output = parseInt((amount / test) % 10);
            try {
                maxsize = getOutputRingSize(output, test, maxsize);
            } catch(e) {
                console.log(e);
            } finally {
                if(!maxsize)
                    maxsize = mature(output*test);

                test *= 10;
            }
        }

        if(maxsize < minsize)
        {
            invalid(el);
            el.parent().after("<div name='err"+el.attr('id')+"' class='warning'>Not enough system and or owned outputs for the requested amount.<br><br>Only <b>"
                     +maxsize+"</b> anonymous outputs exist for coin value: <b>" + unit.format(output*(test/10), $("#unit"+i)) + "</b></div>");
            el.on('change', function(){$("[name=err"+el.attr('id')+"]").remove();});

            $("#tx_ringsize").show();
            $("#suggest_ring_size").show();

            return;
        }
    }
    $("#ring_size").val(maxsize);
}

function toggleCoinControl(enable) {
    if(enable==undefined && $("#coincontrol_enabled")  .css("display") == "block" || enable == false)
    {
        $("#coincontrol_enabled") .css("display", "none");
        $("#coincontrol_disabled").css("display", "block");
    } else
    {
        $("#coincontrol_enabled") .css("display", "block");
        $("#coincontrol_disabled").css("display", "none");
    }
    resizeFooter();
}

function updateCoinControl() {
    if($("#coincontrol_enabled").css("display") == "none")
        return;
    var amount = 0;

    for(var i=0;i<recipients;i++)
        amount += unit.parse($("#amount"+i).val());

    bridge.updateCoinControlAmount(amount);
}

function updateCoinControlInfo(quantity, amount, fee, afterfee, bytes, priority, low, change)
{
    if($("#coincontrol_enabled").css("display") == "none")
        return;

    if (quantity > 0)
    {
        $("#coincontrol_auto").hide();

        var enable_change = (change == "" ? false : true);

        $("#coincontrol_quantity").text(quantity);
        $("#coincontrol_amount")  .text(unit.format(amount));
        $("#coincontrol_fee")     .text(unit.format(fee));
        $("#coincontrol_afterfee").text(unit.format(afterfee));
        $("#coincontrol_bytes")   .text("~"+bytes).css("color", (bytes > 10000 ? "red" : null));
        $("#coincontrol_priority").text(priority).css("color", (priority.indexOf("low") == 0 ? "red" : null)); // TODO: Translations of low...
        $("#coincontrol_low")     .text(low).toggle(enable_change).css("color", (low == "yes" ? "red" : null)); // TODO: Translations of low outputs
        $("#coincontrol_change")  .text(unit.format(change)).toggle(enable_change);

        $("label[for='coincontrol_low']")   .toggle(enable_change);
        $("label[for='coincontrol_change']").toggle(enable_change);

        $("#coincontrol_labels").show();

    } else
    {
        $("#coincontrol_auto").show();
        $("#coincontrol_labels").hide();
        $("#coincontrol_quantity").text("");
        $("#coincontrol_amount")  .text("");
        $("#coincontrol_fee")     .text("");
        $("#coincontrol_afterfee").text("");
        $("#coincontrol_bytes")   .text("");
        $("#coincontrol_priority").text("");
        $("#coincontrol_low")     .text("");
        $("#coincontrol_change")  .text("");
    }
}

var invalid = function(el, valid) {
    if(valid == true)
        el.css("background", "").css("color", "");
    else
        el.css("background", "#6C8C3C").css("color", "white");

    return (valid == true);
}

function sendCoins() {
    bridge.userAction(['clearRecipients']);

    if(bridge.info.options.AutoRingSize && $("#txn_type").val() > 1)
        suggestRingSize();

    for(var i=0;i<recipients;i++) {
        var el = $("#pay_to"+i);
        var valid = true;

        valid = invalid(el, bridge.validateAddress(el.val()));

        el = $("#amount"+i);

        if(unit.parse(el.val()) == 0 && !invalid(el))
            valid = false;

        if(!valid || !bridge.addRecipient($("#pay_to"+i).val(), $("#label"+i).val(), $("#narration"+i).val(), unit.parse($("#amount"+i).val(), $("#unit"+i).val()), $("#txn_type").val(), $("#ring_size").val()))
            return false;
    }

    if(bridge.sendCoins($("#coincontrol_enabled").css("display") != "none", $("#change_address").val()))
        clearRecipients();
}

function receivePageInit() {
    var menu = [{
            name: 'Copy&nbsp;Address',
            img: 'qrc:///icons/editcopy',
            fun: function () {
                copy('#receive .footable .selected .address');
            }
        },
        {
            name: 'Copy&nbsp;Label',
            img: 'qrc:///icons/editcopy',
            fun: function () {
                copy('#receive .footable .selected .label');
            }
        },
        {
            name: 'Copy&nbsp;Public&nbsp;Key',
            img: 'qrc:///icons/editcopy',
            fun: function () {
                copy('#receive .footable .selected .pubkey');
            }
        },
        {
            name: 'Edit',
            img: 'qrc:///icons/edit',
            fun: function () {
                $("#receive .footable .selected .label.editable").dblclick();
            }
        },
        {
            name: 'Show&nbsp;QR&nbsp;Code',
            img: 'qrc:///icons/qrcode',
            fun: function () {
                $("#receive [href='#qrcode-modal']").click();
            }
        }];

    //Calling context menu
     $('#receive .footable tbody').on('contextmenu', function(e) {
        $(e.target).closest('tr').click();
     }).contextMenu(menu, {triggerOn:'contextmenu', sizeStyle: 'content'});

    // Deal with the receive table filtering
    // On any input update the filter 
    $('#filter-address').on('input', function () {
        var receiveTable =  $('#receive-table');

        if($('#filter-address').val() == "")
        {
            receiveTable.data('footable-filter').clearFilter();
        }
        $('#receive-filter').val($('#filter-address').val() + " " + $('#filter-addresstype').val() ) ;
        receiveTable.trigger('footable_filter', {filter: $('#receive-filter').val()});
    });

    $('#filter-addresstype').change(function () {
        var receiveTable =  $('#receive-table');
        if($('#filter-addresstype').val() == "")
        {
            receiveTable.data('footable-filter').clearFilter();
        }
        $('#receive-filter').val($('#filter-address').val() + " " + $('#filter-addresstype').val() ) ;
        receiveTable.trigger('footable_filter', {filter: $('#receive-filter').val()});
    });
}

function clearRecvAddress()
{
    $("#new-address-label").val('');
    $("#new-addresstype").val(1);
}

function addAddress()
{
    newAdd = bridge.newAddress($("#new-address-label").val(), $("#new-addresstype").val());
    
    //TODO: Highlight address
    $("#add-address-modal .modal_close").click();
}

function clearSendAddress()
{
    $("#new-send-label").val('');
    $("#new-send-address").val('');
    $("#new-send-address-error").text('');
    $("#new-send-address").removeClass('inputError');
}

function addSendAddress()
{
    var sendLabel, sendAddress, result;

    sendLabel   = $("#new-send-label").val();
    sendAddress = $("#new-send-address").val();
    
    var addType = 0; // not used
    result = bridge.newAddress(sendLabel, addType, sendAddress, true);
    
    if (result == "")
    {
        var errorMsg = bridge.lastAddressError();
        $("#new-send-address-error").text("Error: " + errorMsg);
        $("#new-send-address").addClass('inputError');
    } else
    {
        $("#add-address-modal .modal_close").click();
    };
}

function addressBookInit() {
    var menu = [{
            name: 'Copy&nbsp;Address',
            img: 'qrc:///icons/editcopy',
            fun: function () {
                copy('#addressbook .footable .selected .address');
            }
        },
        {
            name: 'Copy&nbsp;Public&nbsp;Key',
            img: 'qrc:///icons/editcopy',
            fun: function () {
                copy('#addressbook .footable .selected .pubkey');
            }
        },
        {
            name: 'Copy&nbsp;Label',
            img: 'qrc:///icons/editcopy',
            fun: function () {
                copy('#addressbook .footable .selected .label');
            }
        },
        {
            name: 'Edit',
            img: 'qrc:///icons/edit',
            fun: function () {
                $("#addressbook .footable .selected .label.editable").dblclick();
            }
        },
        {
            name: 'Delete',
            img: 'qrc:///icons/delete',
            fun: function () {
                var addr=$('#addressbook .footable .selected .address');
                if(bridge.deleteAddress(addr.text()))
                    addr.closest('tr').remove();

                resizeFooter();
            }
        },
        {
            name: 'Show&nbsp;QR&nbsp;Code',
            img: 'qrc:///icons/qrcode',
            fun: function () {
                $("#addressbook [href='#qrcode-modal']").click();
            }
        },
        {
            name: 'Verify&nbsp;Message',
            img: 'qrc:///icons/edit',
            fun: function () {
                bridge.userAction({'verifyMessage': $('#addressbook .footable .selected .address').text()});
            }
        }];

    //Calling context menu
     $('#addressbook .footable tbody').on('contextmenu', function(e) {
        $(e.target).closest('tr').click();
     }).contextMenu(menu, {triggerOn:'contextmenu', sizeStyle: 'content'});

    // Deal with the addressbook table filtering
    // On any input update the filter 
    $('#filter-addressbook').on('input', function () {
        var addressbookTable =  $('#addressbook-table');

        if($('#filter-addressbook').val() == "")
        {
            addressbookTable.data('footable-filter').clearFilter();
        }
        $('#addressbook-filter').val($('#filter-addressbook').val() + " " + $('#filter-addressbooktype').val() ) ;
        addressbookTable.trigger('footable_filter', {filter: $('#addressbook-filter').val()});
    });

    $('#filter-addressbooktype').change(function () {
        var addressbookTable =  $('#addressbook-table');
        if($('#filter-addresstype').val() == "")
        {
            addressbookTable.data('footable-filter').clearFilter();
        }
        $('#addressbook-filter').val($('#filter-addressbook').val() + " " + $('#filter-addressbooktype').val() ) ;
        addressbookTable.trigger('footable_filter', {filter: $('#addressbook-filter').val()});
    });
}


var Name = 'Me';
var initialAddress = true;

function appendAddresses(addresses) {
    if(typeof addresses == "string")
    {
        if(addresses == "[]")
            return;

        addresses = JSON.parse(addresses.replace(/,\]$/, "]"));
    }

    for(var i=0; i< addresses.length;i++)
    {
        var address = addresses[i];
		
        var addrRow = $("#"+address.address);
        var page = (address.type == "S" ? "#addressbook" : (address.label.lastIndexOf("group_", 0) !== 0 ? "#receive" : "#addressbook"));
            
        if(address.type == "R" && address.address.length < 75 && address.label.lastIndexOf("group_", 0) !== 0) {
            if(addrRow.length==0){
                $("#message-from-address").append("<option title='"+address.address+"' value='"+address.address+"'>"+address.label+"</option>");
            } else {
                $("#message-from-address option[value="+address.address+"]").text(address.label);
			}
			
            if(initialAddress) {
                $("#message-from-address").prepend("<option title='Anonymous' value='anon' selected>Anonymous</option>");
                $(".user-name")   .text(Name);
                $(".user-address").text(address.address);
                initialAddress = false;
            }
        }
        
        if (addrRow.length==0 )
        {
            $( page + " .footable tbody").append(
                "<tr id='"+address.address+"' lbl='"+address.label+"'>\
               <td class='label editable' data-value='"+address.label_value+"'>"+address.label+"</td>\
               <td class='address'>"+address.address+"</td>\
               <td class='pubkey'>"+address.pubkey+"</td>\
               <td class='addresstype'>"+(address.at == 3 ? "BIP32" : address.at == 2 ? "Stealth" : "Normal")+"</td></tr>");
            
            $("#"+address.address)
            .on('click', function() {
                $(this).addClass("selected").siblings("tr").removeClass("selected");
            }).find(".editable").on("dblclick", function (event) {
                event.stopPropagation();
                updateValue($(this));
            }).attr("data-title", "Double click to edit").on('mouseenter', tooltip);
        }
        else
        {
            $("#"+address.address+" .label") .data("value", address.label_value).text(address.label);
            $("#"+address.address+" .pubkey").text(address.pubkey);
        }

    }
    
    var table = $('#addressbook .footable,#receive .footable').trigger("footable_setup_paging");

}

function prepAddressLookup(lReceiveAddresses)
{
    var page = (lReceiveAddresses ? "#receive" : "#addressbook");
    var table =  $(page + "-table"); 
    var lookupTable = $("#address-lookup-table");

    lookupTable.data().pageSize = 5;
    lookupTable.trigger('footable_initialize');
    lookupTable.html( table.html() );
    lookupTable.data('footable-filter').clearFilter();

    $("#address-lookup-table > tbody tr")
        .on('click', function() {
            $(this).addClass("selected").siblings("tr").removeClass("selected");
        })
        .on('dblclick', function() {
            var retfields = returnto.split(',');
            $("#" + retfields[0]).val( $(this).attr("id").trim() );
            if(retfields[1] != undefined )
            {
                $("#" + retfields[1]).val( $(this).attr("lbl").trim() ); 
            }
            $("#address-lookup-modal .modal_close").click();
        })

    // Deal with the lookup table filtering
    // On any input update the filter 
    $('#lookup-addressfilter').on('input', function () {
        if($('#lookup-addressfilter').val() == "")
        {
            lookupTable.data('footable-filter').clearFilter();
        }
        $('#lookup-filter').val($('#lookup-addressfilter').val() + " " + $('#lookup-addresstype').val() ) ;
        lookupTable.trigger('footable_filter', {filter: $('#lookup-filter').val()});
    });

    $('#lookup-addresstype').change(function () {
        if($('#filter-addresstype').val() == "")
        {
            lookupTable.data('footable-filter').clearFilter();
        }
        $('#lookup-filter').val($('#lookup-addressfilter').val() + " " + $('#lookup-addresstype').val() ) ;
        lookupTable.trigger('footable_filter', {filter: $('#lookup-filter').val()});
    });
}

function transactionPageInit() {
    var menu = [{
            name: 'Copy&nbsp;Address',
            img: 'qrc:///icons/editcopy',
            fun: function () {
                copy('#transactions .footable .selected .address', "data-value");
            }
        },
        {
            name: 'Copy&nbsp;Label',
            img: 'qrc:///icons/editcopy',
            fun: function () {
                copy('#transactions .footable .selected .address', "data-label");
            }
        },
        {
            name: 'Copy&nbsp;Amount',
            img: 'qrc:///icons/editcopy',
            fun: function () {
                copy('#transactions .footable .selected .amount');
            }
        },
        {
            name: 'Copy&nbsp;transaction&nbsp;ID',
            img: 'qrc:///icons/editcopy',
            fun: function () {
                copy('#transactions .footable .selected', "id");
            }
        },
        {
            name: 'Edit&nbsp;label',
            img: 'qrc:///icons/edit',
            fun: function () {
                $("#transactions .footable .selected .address .editable").dblclick();
            }
        },
        {
            name: 'Show&nbsp;transaction&nbsp;details',
            img: 'qrc:///icons/history',
            fun: function () {
                $("#transactions .footable .selected").dblclick();
            }
        }];

    //Calling context menu
     $('#transactions .footable tbody').on('contextmenu', function(e) {
        $(e.target).closest('tr').click();
     }).contextMenu(menu, {triggerOn:'contextmenu', sizeStyle: 'content'});

    $('#transactions .footable').on("footable_paging", function(e) {
        var transactions = filteredTransactions.slice(e.page * e.size)
            transactions = transactions.slice(0, e.size);

        var $tbody = $("#transactions .footable tbody");

        $tbody.html("");

        delete e.ft.pageInfo.pages[e.page];

        e.ft.pageInfo.pages[e.page] = transactions.map(function(val) {
            val.html = formatTransaction(val);

            $tbody.append(val.html);

            return $("#"+val.id)[0];
        });
        e.result = true;

        bindTransactionTableEvents();
        resizeFooter();

    }).on("footable_create_pages", function(e) {
        var $txtable = $("#transactions .footable");
        if(!$($txtable.data("filter")).val())
            filteredTransactions = Transactions;

        /* Sort Columns */
        var sortCol = $txtable.data("sorted"),
            sortAsc = $txtable.find("th.footable-sorted").length == 1,
            sortFun = 'numeric';

        switch(sortCol)
        {
        case 0:
            sortCol = 'c';
            break;
        case 2:
            sortCol = 't_l',
            sortFun = 'alpha';
            break;
        case 3:
            sortCol = 'ad',
            sortFun = 'alpha';
            break;
        case 4:
            sortCol = 'n',
            sortFun = 'alpha';
            break;
        case 5:
            sortCol = 'am';
            break;
        default:
            sortCol = 'd';
            break;
        }

        sortFun = e.ft.options.sorters[sortFun];

        filteredTransactions.sort(function(a, b) {
            return sortAsc ? sortFun(a[sortCol], b[sortCol]) : sortFun(b[sortCol], a[sortCol]);
        });
        /* End - Sort Columns */

        /* Add pages */
        delete e.ft.pageInfo.pages;
        e.ft.pageInfo.pages = [];
        var addPages = Math.ceil(filteredTransactions.length / e.ft.pageInfo.pageSize),
            newPage  = [];

        if(addPages > 0)
        {
            for(var i=0;i<e.ft.pageInfo.pageSize;i++)
                newPage.push([]);

            for(var i=0;i<addPages;i++)
                e.ft.pageInfo.pages.push(newPage);
        }

        /* End - Add pages */
    }).on("footable_filtering", function(e) {
        if(e.clear)
            return true;

        filteredTransactions = Transactions.filter(function(transaction) {
            for(var prop in transaction)
                if(transaction[prop].toString().toLowerCase().indexOf(e.filter.toLowerCase()) != -1)
                    return true;

            return false;
        });
    });
}


var Transactions = [],
    filteredTransactions = [];

function formatTransaction(transaction) {
    return "<tr id='"+transaction.id+"' data-title='"+transaction.tt+"'>\
                    <td data-value='"+transaction.c+"'><i class='fa fa-lg "+transaction.s+" margin-right-10'></td>\
                    <td data-value='"+transaction.d+"'>"+transaction.d_s+"</td>\
                    <td>"+transaction.t_l+"</td>\
                    <td class='address' style='color:"+transaction.a_c+";' data-value='"+transaction.ad+"' data-label='"+transaction.ad_l+"'><img src='qrc:///icons/tx_"+transaction.t+"' /><span class='editable'>"+transaction.ad_d+"</span></td>\
                    <td>"+transaction.n+"</td>\
                    <td class='amount' style='color:"+transaction.am_c+";' data-value='"+transaction.am+"'>"+transaction.am_d+"</td>\
                 </tr>";
}

function visibleTransactions(visible) {
    if(visible[0] != "*")
        Transactions = Transactions.filter(function(val) {
            return this.some(function(val){return val == this}, val.t_l);
        }, visible);
}

function bindTransactionTableEvents() {

    $("#transactions .footable tbody tr")
    .on('mouseenter', tooltip)

    .on('click', function() {
        $(this).addClass("selected").siblings("tr").removeClass("selected");
    })

    .on("dblclick", function(e) {
        $(this).attr("href", "#transaction-info-modal");

        $(this).leanModal({ top : 10, overlay : 0.5, closeButton: "#transaction-info-modal .modal_close" });
        $("#transaction-info").html(bridge.transactionDetails($(this).attr("id")));
        $(this).click();

        $(this).off('click');
        $(this).on('click', function() {
                $(this).addClass("selected").siblings("tr").removeClass("selected");
        })
    }).find(".editable")

   .on("dblclick", function (event) {
      event.stopPropagation();
      event.preventDefault();
      updateValue($(this));
   }).attr("data-title", "Double click to edit").on('mouseenter', tooltip);
}

function appendTransactions(transactions) {
    if(typeof transactions == "string")
    {
        if(transactions == "[]")
            return;

        transactions = JSON.parse(transactions.replace(/,\]$/, "]"));
    }

    if(transactions.length==1 && transactions[0].id==-1)
        return;

    transactions.sort(function (a, b) {
        a.d = parseInt(a.d);
        b.d = parseInt(b.d);

        return b.d - a.d;
    });

    Transactions = Transactions.filter(function(val) {
        return this.some(function(val) {
            return val.id == this.id;
        }, val) == false;
    }, transactions)
    .concat(transactions);

    overviewPage.recent(transactions.slice(0,7));

    $("#transactions .footable").trigger("footable_redraw");
}

function chatInit() {
    var menu = [{
            name: 'Send&nbsp;EduCoin',
            fun: function () {
                clearRecipients();
                $("#pay_to0").val($('#contact-list .selected .contact-address').text());
                $("#navpanel [href=#send]").click();
            }
        },
        {
            name: 'Copy&nbsp;Address',
            fun: function () {
                copy('#contact-list .selected .contact-address');
            }
        },
        /*
        {
            name: 'Send&nbsp;File',
            img: 'qrc:///icons/editcopy',
            fun: function () {
                copy('#transactions .footable .selected .address', "data-label");
            }
        },*/
        {
            name: 'Private&nbsp;Message',
            fun: function () {
                $("#message-text").focus();
            }
        } /*,
        {
            name: 'Edit&nbsp;Label',
            fun: function () {
                console.log("todo"); //TODO: this...
            }
        } /*,
        {
            name: 'Block&nbsp;Address',
            fun: function () {
                console.log("todo"); //TODO: Blacklist...
            }
        }*/
        ];

    //Calling context menu
    $('#contact-list').on('contextmenu', function(e) {
       $(e.target).closest('li').click();
    }).contextMenu(menu, {triggerOn:'contextmenu', sizeStyle: 'content'});

    menu = [{
            name: 'Copy&nbsp;Message',
            fun: function () {
                var selected = $(".contact-discussion li.selected"),
                    id = selected.attr("id");

                $.each(contacts[selected.attr("contact-key")].messages, function(index){if(this.id == id) copy(this.message, 'copy');});
            }
        },
        /*
        {
            name: 'Send&nbsp;File',
            fun: function () {
                copy('#transactions .footable .selected .address', "data-label");
            }
        },*/
        {
            name: 'Delete&nbsp;Message',
            fun: function () {
                $(".contact-discussion li.selected").find(".delete").click();
            }
        }];

    $('.contact-discussion').on('contextmenu', function(e) {
        $(e.target).closest('li').addClass("selected");
    }).contextMenu(menu, {triggerOn:'contextmenu', sizeStyle: 'content'});

    menu = [
        {
            name: 'Copy&nbsp;Selected',
            fun: function () {
                var editor = $("#message-text")[0];

                if (typeof editor.selectionStart !== 'undefined')
                    copy(editor.value.substring(editor.selectionStart, editor.selectionEnd), 'copy');
            }
        },
        {
            name: 'Paste',
            fun: function () {
                paste("#pasteTo");

                var editor = $("#message-text")[0];

                if(typeof editor.selectionStart !== 'undefined')
                    editor.value = editor.value.substring(editor.selectionStart, 0) + $("#pasteTo").val() + editor.value.substring(editor.selectionStart);
                else
                    editor.value += $("#pasteTo").val();
            }
        }];

    $('#message-text').contextMenu(menu, {triggerOn:'contextmenu', sizeStyle: 'content'});
}

var contacts = {};
var contact_list;

function appendMessages(messages, reset) {
    contact_list = $("#contact-list ul");

    if(reset)
    {
        contacts = null;
        contacts = {};
        contact_list.html("");
        $("#contact-list").removeClass("in-conversation");
        $(".contact-discussion ul").html("");
        $(".user-notifications").hide();
        $("#message-count").text(0);
        messagesScroller.scrollTo(0, 0);
        contactScroll   .scrollTo(0, 0);
    }

    if(messages == "[]")
        return;

    messages = JSON.parse(messages.replace(/,\]$/, "]"));

    // Massage data
    for(var i=0; i<messages.length; i++)
    {
        var message = messages[i];
        appendMessage(message.id,
                      message.type,
                      message.sent_date,
                      message.received_date,
                      message.label_value,
                      message.label,
					  message.labelTo,
                      message.to_address,
                      message.from_address,
                      message.read,
                      message.message,
                      true);
    }

    for (key in contacts) {
        appendContact(key);
    }

    contact_list.find("li:first-child").click();

}

function appendMessage(id, type, sent_date, received_date, label_value, label, labelTo, to_address, from_address, read, message, initial) {
    if(type=="R"&&read==false) {
        $(".user-notifications").show();
        $("#message-count").text(parseInt($("#message-count").text())+1);
    }

    var them = type == "S" ? to_address   : from_address;
    var self = type == "S" ? from_address : to_address;

    var label_msg = type == "S" ? (labelTo == "(no label)" ? self : labelTo) : (label == "(no label)" ? them : label);

    var key = (label_value == "" ? them : label_value).replace(/\s/g, '');

	var group = false;
    //Setup instructions: make sure the receiving address is named 'group_ANYTHING'. 
    //It's best to add the sender of the message with a label so you get a nice overview!

    /* This is just a cheat to test the formatting, because the if clause down below is always returning false.
    It will put all messages under the same contact*/

    if(type == "R" && labelTo.lastIndexOf("group_", 0) === 0){ //Received, to group
        key = labelTo.replace('group_', '');

        group = true;
    } else if(label_value.lastIndexOf("group_", 0) === 0){ //sent to group, 
        key = label_value.replace('group_', '');
        group = true;
    } else if(labelTo.lastIndexOf("group_", 0) === 0){ //sent by group, should not be possible but yeah anything can happen.
        group = true;
    }

	//alert("Debug label=" + label_value + " labelTo=" + labelTo + " group=" + group + " key (me)=" + key);
    /* 
    Basically I seperated the sender of the message (label_msg) from the contact[key].
    So we can still group by the key, but the messages in the chat have the right sender label.
    */

    var contact = contacts[key];

    if(contacts[key] == undefined)
        contacts[key] = {},
        contact = contacts[key],
        contact.key = key,
        contact.label = key,
        contact.avatar = (false ? '' : 'qrc:///images/default'), // TODO: Avatars!!
        contact.messages  = new Array();

    if($.grep(contact.messages, function(a){ return a.id == id; }).length == 0)
    {
        contact.messages.push({id:id, them: them, self: self, label_msg: label_msg, group: group, message: message, type: type, sent: sent_date, received: received_date, read: read});

        if(!initial)
            appendContact(key, true);
    }
}

function appendContact (key, newcontact) {
    var contact_el = $("#contact-"+key);
    var contact = contacts[key];

    var unread_count = $.grep(contact.messages, function(a){return a.type=="R"&&a.read==false}).length;

    var contact_address = (contact.messages[0].group && contact.messages[0].type != "S") ? contact.messages[0].self : contact.messages[0].them;
    if(contact_el.length == 0) {
        //alert("[appendContact] key=" + key + " address=" + contact.messages[0].them + " self=" + contact.messages[0].self + " group=" + contact.messages[0].group + " type=" + contact.messages[0].type);
        contact_list.append(
            "<li id='contact-"+ key +"' class='contact' data-title='"+contact.label+"'>\
                <img src='"+ contact.avatar +"' />\
                <span class='contact-info'>\
                    <span class='contact-name'>"+contact.label+"</span>\
                    <span class='contact-address'>"+ contact_address + "</span>\
                </span>\
                <span class='contact-options'>\
                        <span class='message-notifications"+(unread_count==0?' none':'')+"'>"+unread_count+"</span>\
                        <span class='delete' onclick='deleteMessages(\""+key+"\")'></span>\
                        " //<span class='favorite favorited'></span>\ //TODO: Favourites
             + "</span>"
             + "</li>");

        contact_el = $("#contact-"+key).on('click', function(e) {
            $(this).addClass("selected").siblings("li").removeClass("selected");
            $("#contact-list").addClass("in-conversation");
            var discussion = $(".contact-discussion ul");
            var contact = contacts[e.delegateTarget.id.replace(/^contact\-/, '')];

            discussion.html("");

            contact.messages.sort(function (a, b) {
              return a.received - b.received;
            });

            var message;
			var bSentMessage = false;

            for(var i=0;i<contact.messages.length;i++)
            {
                message = contact.messages[i];
                if(message.read == false && bridge.markMessageAsRead(message.id))
                {
                    var message_count = $("#message-count"),
                        message_count_val = parseInt(message_count.text())-1;

                    message_count.text(message_count_val);
                    if(message_count_val==0)
                        message_count.hide();
                    else
                        message_count.show();
                }

                //title='"+(message.type=='S'? message.self : message.them)+"' taken out below.. titles getting in the way..
                discussion.append(
                    "<li id='"+message.id+"' class='"+(message.type=='S'?'user-message':'other-message')+"' contact-key='"+contact.key+"'>\
                    <span class='info'>\
                        <img src='"+contact.avatar+"' />\
                        <span class='user-name'>"
                            +(message.type=='S'? (message.self == 'anon' ? 'anon' : message.label_msg) : message.label_msg)+"\
                        </span>\
                    </span>\
                    <span class='message-content'>\
                        <span class='timestamp'>"+(new Date(message.received*1000).toLocaleString())+"</span>\
                        <span class='message-text'>"+micromarkdown.parse(message.message)+"</span>\
                        <span class='delete' onclick='deleteMessages(\""+contact.key+"\", \""+message.id+"\");'></span>\
                    </span></li>");

                if(message.group && message.type == 'S' && !bSentMessage){ //Check if group message, if we sent a message in the past and make sure we assigned the same sender address to the chat.
                        bSentMessage = true;
                        $("#message-from-address").val(message.self);
                        $("#message-to-address").val(message.them);
                }

            }


            messagesScroller.refresh();

            messagesScroller.scrollTo(0, messagesScroller.maxScrollY, 600);

            var scrollerBottom = function() {

                var max = messagesScroller.maxScrollY;

                messagesScroller.refresh();

                if(max != messagesScroller.maxScrollY)
                    messagesScroller.scrollTo(0, messagesScroller.maxScrollY, 100);
            };

            setTimeout(scrollerBottom, 700);
            setTimeout(scrollerBottom, 1000);
            setTimeout(scrollerBottom, 1300);
            setTimeout(scrollerBottom, 1600);
            setTimeout(scrollerBottom, 1900);
            setTimeout(scrollerBottom, 2200);
            setTimeout(scrollerBottom, 2500);
            setTimeout(scrollerBottom, 5000);

            //discussion.children("[title]").on("mouseenter", tooltip);
			
            if(!bSentMessage){
                if(!message.group){ //normal procedure
                    $("#message-from-address").val(message.self);
                    $("#message-to-address").val(message.them); //them
                } else if(message.type == "R") { //if it's a group, and no messages were sent from it yet, then we have not sent a message to it.
                    $("#message-to-address").val(message.self);
                }
            }
			
        }).on("mouseenter", tooltip);

        contact_el.find(".delete").on("click", function(e) {e.stopPropagation()});

    } else {
        var received_message = contact.messages[contact.messages.length-1];

        if(received_message.type=="R"&&received_message.read==false) {
            var notifications = contact_el.find(".message-notifications");
            notifications.text(unread_count);
        }
    }

    if(newcontact || contact_el.hasClass("selected"))
        contact_el.click();
}

function newConversation() {
    $("#new-contact-modal .modal_close").click();
    $("#message-to-address").val($("#new-contact-address").val());
    $("#message-text").focus();
    $(".contact-discussion ul").html("<li id='remove-on-send'>Starting Conversation with "+$("#new-contact-address").val()+" - "+$("#new-contact-name").val()+"</li>");

    $("#new-contact-address").val("");
    $("#new-contact-name").val("");
    $("#new-contact-pubkey").val("");
    $("#contact-list ul li").removeClass("selected");
    $("#contact-list").addClass("in-conversation");
}


function sendMessage() {
    $("#remove-on-send").remove();
    if(bridge.sendMessage($("#message-to-address").val(), $("#message-text").val(), $("#message-from-address").val()))
        $("#message-text").val("");
}

function deleteMessages(key, messageid) {
    var contact = contacts[key];

    if(!confirm("Are you sure you want to delete " + (messageid == undefined ? 'these messages?' : 'this message?')))
        return false;

    var message_count = $("#message-count"),
        message_count_val = parseInt(message_count.text());

    for(var i=0;i<contact.messages.length;i++) {

        if(messageid == undefined) {
            if(bridge.deleteMessage(contact.messages[i].id))
            {
                $("#"+contact.messages[i].id).remove();

                if(contact.messages[i].type=="R" && contact.messages[i].read == false)
                {
                    message_count_val--
                    message_count.text(message_count_val);
                    if(message_count_val==0)
                        message_count.hide();
                    else
                        message_count.show();
                }

                contact.messages.splice(i, 1);
                i--;
            }
            else
                return false;
        }
        else
        if(contact.messages[i].id == messageid)
            if(bridge.deleteMessage(messageid)) {
                $("#"+messageid).remove();

                if(contact.messages[i].type=="R" && contact.messages[i].read == false)
                {
                    message_count_val--
                    message_count.text(message_count_val);
                    if(message_count_val==0)
                        message_count.hide();
                    else
                        message_count.show();
                }

                contact.messages.splice(i, 1);
                i--;
                var notifications = $("#contact-"+ key).find(".message-notifications");
                notifications.text(parseInt(notifications.text())-1);
                break;
            }
            else
                return false;
    }

    if(contact.messages.length == 0)
    {
        $("#contact-"+ key).remove();
        $("#contact-list").removeClass("in-conversation");
    }
    else
        iscrollReload();
}

function signMessage() {
    //Clear any signature to avoid confusion with a previous signature being displayed with errors relating to the current values
    $('#sign-signature').val("");
    var address, message, error, signature = "";
    address = $('#sign-address').val().trim();
    message = $('#sign-message').val().trim();

    var result = bridge.signMessage(address, message);

    error = result.error_msg;
    signature = result.signed_signature;

    if(error != "" )
    {
        $('#sign-result').removeClass('green');
        $('#sign-result').addClass('red');
        $('#sign-result').html(error);
        return false;
    }
    else
    {
        $('#sign-signature').val(result.signed_signature);
        $('#sign-result').removeClass('red');
        $('#sign-result').addClass('green');
        $('#sign-result').html("Message signed successfully");
    }
}

function verifyMessage() {

    var address, message, error, signature = "";
    address = $('#verify-address').val().trim();
    message = $('#verify-message').val().trim();
    signature = $('#verify-signature').val().trim();
    
    var result = bridge.verifyMessage(address, message, signature);

    error = result.error_msg;
    
    if(error != "" )
    {
        $('#verify-result').removeClass('green');
        $('#verify-result').addClass('red');
        $('#verify-result').html(error);
        return false;
    }
    else
    {
        $('#verify-result').removeClass('red');
        $('#verify-result').addClass('green');
        $('#verify-result').html("Message verified successfully");
    }
}

var contactScroll = new IScroll('#contact-list', {
    mouseWheel: true,
    scrollbars: true,
    lockDirection: true,
    interactiveScrollbars: true,
    scrollbars: 'custom',
    scrollY: true,
    scrollX: false,
    preventDefaultException:{ tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|P|SPAN)$/ }
});

var messagesScroller = new IScroll('.contact-discussion', {
   mouseWheel: true,
   scrollbars: true,
   lockDirection: true,
   interactiveScrollbars: true,
   scrollbars: 'custom',
   scrollY: true,
   scrollX: false,
   preventDefaultException:{ tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|P|SPAN)$/ }
});

function iscrollReload(scroll) {
    contactScroll.refresh();
    messagesScroller.refresh();

    if(scroll == true)
        messagesScroller.scrollTo(0, messagesScroller.maxScrollY, 0);
}


function editorCommand(text, endText) {

        var range, start, end, txtLen, scrollTop;

        var editor = $("#message-text")[0];

        scrollTop = editor.scrollTop;
        editor.focus();


        if (typeof editor.selectionStart !== 'undefined')
        {
                start  = editor.selectionStart;
                end    = editor.selectionEnd;
                txtLen = text.length;

                if(endText)
                        text += editor.value.substring(start, end) + endText;

                editor.value = editor.value.substring(0, start) + text + editor.value.substring(end, editor.value.length);

                editor.selectionStart = (start + text.length) - (endText ? endText.length : 0);
                editor.selectionEnd = editor.selectionStart;
        }
        else
            editor.value += text + endText;

        editor.scrollTop = scrollTop;
        editor.focus();
};

var blockExplorerPage = 
{
    blockHeader: {},
    findBlock: function(searchID) {

        if(searchID == "" || searchID == null)
        {
            blockExplorerPage.updateLatestBlocks();
        }
        else
        {
            blockExplorerPage.foundBlock = bridge.findBlock(searchID);

            if(blockExplorerPage.foundBlock.error_msg != '' )
            { 
                $('#latest-blocks-table  > tbody').html('');
                $("#block-txs-table > tbody").html('');
                $("#block-txs-table").addClass("none");
                alert(blockExplorerPage.foundBlock.error_msg);
                return false;
            } 

            var tbody = $('#latest-blocks-table  > tbody');
            tbody.html('');
            var txnTable = $('#block-txs-table  > tbody');
            txnTable.html('');
            $("#block-txs-table").addClass("none");

            tbody.append('<tr data-value='+blockExplorerPage.foundBlock.block_hash+'>\
                                     <td>'+blockExplorerPage.foundBlock.block_hash+'</td>\
                                     <td>'+blockExplorerPage.foundBlock.block_height+'</td>\
                                     <td>'+blockExplorerPage.foundBlock.block_timestamp+'</td>\
                                     <td>'+blockExplorerPage.foundBlock.block_transactions+'</td>\
                        </tr>'); 
            blockExplorerPage.prepareBlockTable();
        }
        // Keeping this just in case - Will remove if not used 
    },
    updateLatestBlocks: function() 
    {
        blockExplorerPage.latestBlocks = bridge.listLatestBlocks();
        var txnTable = $('#block-txs-table  > tbody');
        txnTable.html('');
        $("#block-txs-table").addClass("none");
        var tbody = $('#latest-blocks-table  > tbody');
        tbody.html('');
        for (value in blockExplorerPage.latestBlocks) {

            var latestBlock = blockExplorerPage.latestBlocks[value];

            tbody.append('<tr data-value='+latestBlock.block_hash+'>\
                         <td>' +  latestBlock.block_hash   + '</td>\
                         <td>' +  latestBlock.block_height + '</td>\
                         <td>' +  latestBlock.block_timestamp   + '</td>\
                         <td>' +  latestBlock.block_transactions+ '</td>\
                         </tr>'); 
        }
        blockExplorerPage.prepareBlockTable();
    },
    prepareBlockTable: function()
    {
        $("#latest-blocks-table  > tbody tr")
            .on('click', function()
                { 
                    $(this).addClass("selected").siblings("tr").removeClass("selected"); 
                    var blkHash = $(this).attr("data-value").trim();
                    blockExplorerPage.blkTxns = bridge.listTransactionsForBlock(blkHash);
                    var txnTable = $('#block-txs-table  > tbody');
                    txnTable.html('');
                    for (value in blockExplorerPage.blkTxns)
                    {
                        var blkTx = blockExplorerPage.blkTxns[value];

                        txnTable.append('<tr data-value='+blkTx.transaction_hash+'>\
                                    <td>' +  blkTx.transaction_hash  + '</td>\
                                    <td>' +  blkTx.transaction_value + '</td>\
                                    </tr>'); 
                    }

                    $("#block-txs-table").removeClass("none");
                    $("#block-txs-table > tbody tr")
                        .on('click', function() {
                            $(this).addClass("selected").siblings("tr").removeClass("selected");
                        })

                        .on("dblclick", function(e) {
                            $(this).attr("href", "#blkexp-txn-modal");

                            $(this).leanModal({ top : 10, overlay : 0.5, closeButton: "#blkexp-txn-modal .modal_close" });

                            selectedTxn = bridge.txnDetails(blkHash , $(this).attr("data-value").trim());

                            if(selectedTxn.error_msg == '')
                            {
                                $("#txn-hash").html(selectedTxn.transaction_hash);
                                $("#txn-size").html(selectedTxn.transaction_size);
                                $("#txn-rcvtime").html(selectedTxn.transaction_rcv_time);
                                $("#txn-minetime").html(selectedTxn.transaction_mined_time);
                                $("#txn-blkhash").html(selectedTxn.transaction_block_hash);
                                $("#txn-reward").html(selectedTxn.transaction_reward);
                                $("#txn-confirmations").html(selectedTxn.transaction_confirmations);
                                $("#txn-value").html(selectedTxn.transaction_value);
                                $("#error-msg").html(selectedTxn.error_msg);

                                if(selectedTxn.transaction_reward > 0)
                                {
                                    $("#lbl-reward-or-fee").html('<strong>Reward</strong>');
                                    $("#txn-reward").html(selectedTxn.transaction_reward);
                                }
                                else
                                {
                                    $("#lbl-reward-or-fee").html('<strong>Fee</strong>');
                                    $("#txn-reward").html(selectedTxn.transaction_reward * -1);
                                }
                            }

                            var txnInputs = $('#txn-detail-inputs > tbody');
                            txnInputs.html('');
                            for (value in selectedTxn.transaction_inputs) 
                            {



                              var txnInput = selectedTxn.transaction_inputs[value];

                              txnInputs.append('<tr data-value='+ txnInput.input_source_address+'>\
                                                           <td>' + txnInput.input_source_address  + '</td>\
                                                           <td>' + txnInput.input_value + '</td>\
                                                </tr>'); 
                            }

                            var txnOutputs = $('#txn-detail-outputs > tbody');
                            txnOutputs.html('');

                            for (value in selectedTxn.transaction_outputs) {

                              var txnOutput = selectedTxn.transaction_outputs[value];

                              txnOutputs.append('<tr data-value='+ txnOutput.output_source_address+'>\
                                                 <td>' +  txnOutput.output_source_address  + '</td>\
                                                 <td>' +  txnOutput.output_value + '</td>\
                                            </tr>'); 
                            }



                            $(this).click();
                            $(this).off('click');
                            $(this).on('click', function() {
                                    $(this).addClass("selected").siblings("tr").removeClass("selected");
                            })
                        }).find(".editable")
                })
            .on("dblclick", function(e) 
            {
                $(this).attr("href", "#block-info-modal");

                $(this).leanModal({ top : 10, overlay : 0.5, closeButton: "#block-info-modal .modal_close" });

                selectedBlock = bridge.blockDetails($(this).attr("data-value").trim()) ;

                if(selectedBlock)
                {
                     $("#blk-hash").html(selectedBlock.block_hash);
                     $("#blk-numtx").html(selectedBlock.block_transactions);
                     $("#blk-height").html(selectedBlock.block_height);
                     $("#blk-type").html(selectedBlock.block_type);
                     $("#blk-reward").html(selectedBlock.block_reward);
                     $("#blk-timestamp").html(selectedBlock.block_timestamp);
                     $("#blk-merkleroot").html(selectedBlock.block_merkle_root);
                     $("#blk-prevblock").html(selectedBlock.block_prev_block);
                     $("#blk-nextblock").html(selectedBlock.block_next_block);
                     $("#blk-difficulty").html(selectedBlock.block_difficulty);
                     $("#blk-bits").html(selectedBlock.block_bits);
                     $("#blk-size").html(selectedBlock.block_size);
                     $("#blk-version").html(selectedBlock.block_version);
                     $("#blk-nonce").html(selectedBlock.block_nonce);
                }

                // $("#block-info").html();
                $(this).click();

                $(this).off('click');
                $(this).on('click', function() {
                $(this).addClass("selected").siblings("tr").removeClass("selected");
                })
            }).find(".editable")
    }
}

var keyManagementPage = {
    init: function() {
        setupWizard('new-key-wizard');
        setupWizard('recover-key-wizard');
        setupWizard('open-key-wizard');
    },

    newMnemonic: function () {
        var result = bridge.getNewMnemonic( $("#new-account-passphrase").val(), $("#new-account-language").val() );
        var error  = result.error_msg;
        var mnemonic = result.mnemonic;

        if(error != "")
        {
            alert(error);
        }
        else
        {
            $("#new-key-mnemonic").val(mnemonic);
        }
    },
    compareMnemonics: function () {
        var original = $("#new-key-mnemonic").val().trim();
        var typed    = $("#validate-key-mnemonic").val().trim();

        if (original == typed) {
            $("#validate-key-mnemonic").removeClass("red");
            $("#validate-key-mnemonic").val("");
            return true;
        }
        else
        {
            $("#validate-key-mnemonic").addClass("red");
            alert("The mnemonic you provided does not match the mnemonic that was generated eariler - please go back and check to make sure you've copied it down correctly.")
            return false;
        }
    },
    gotoPage: function(page) {
        $("#navitems a[href='#" + page + "']").trigger('click');
    },
    prepareAccountTable: function()
    {
        $("#extkey-account-table  > tbody tr")
            .on('click', function()
            {
                $(this).addClass("selected").siblings("tr").removeClass("selected");
                var otherTableRows = $('#extkey-table > tbody > tr');
                otherTableRows.removeClass("selected");
            })
    },
    updateAccountList: function() {
        keyManagementPage.accountList = bridge.extKeyAccList();

        var tbody = $('#extkey-account-table  > tbody');
        tbody.html('');
        for (value in keyManagementPage.accountList) {

            var acc = keyManagementPage.accountList[value];

            tbody.append('<tr data-value='+acc.id+' active-flag=' + acc.active + '>\
                         <td>' +  acc.id   + '</td>\
                         <td>' +  acc.label + '</td>\
                         <td>' +  acc.created_at + '</td>\
                         <td><div ' + ((acc.active == 'true') ? 'class="green-circle"' : 'class="red-circle"') + ' ></td>\
                         <td style="font-size: 2em; margin: auto;">' +  ((acc.default_account != undefined ? "&#x2611;" : "")) + '</td>\
                         </tr>'); 
        }
        keyManagementPage.prepareAccountTable();
    },
    prepareKeyTable: function()
    {
        $("#extkey-table  > tbody tr")
            .on('click', function()
            { 
                $(this).addClass("selected").siblings("tr").removeClass("selected"); 
                var otherTableRows = $('#extkey-account-table > tbody > tr');
                otherTableRows.removeClass("selected");
            })   
    },
    updateKeyList: function() {
        keyManagementPage.keyList = bridge.extKeyList();

        var tbody = $('#extkey-table  > tbody');
        tbody.html('');
        for (value in keyManagementPage.keyList) {

            var key = keyManagementPage.keyList[value];
            tbody.append('<tr data-value='+key.id+' active-flag=' + key.active + '>\
                         <td>' +  key.id   + '</td>\
                         <td>' +  key.label + '</td>\
                         <td>' +  key.path + '</td>\
                         <td><div ' + ((key.active == 'true') ? 'class="green-circle"' : 'class="red-circle"') + ' ></td>\
                         <td style="font-size: 2em; margin: auto;">' +  ((key.current_master != undefined ? "&#x2611;" : "")) + '</td>\
                         </tr>'); 
        }
        keyManagementPage.prepareKeyTable();
    },
    newKey: function()
    {
        result = bridge.importFromMnemonic($('#new-key-mnemonic').val().trim(),
                                           $('#new-account-passphrase').val().trim(),
                                           $('#new-account-label').val().trim(),
                                           $('#new-account-bip44').prop("checked"));

        if(result.error_msg != '' )
        {
            alert(result.error_msg);
            return false;
        }
    },
    recoverKey: function()
    {
        result = bridge.importFromMnemonic($("#recover-key-mnemonic").val().trim(),
                                           $("#recover-passphrase").val().trim(),
                                           $("#recover-account-label").val().trim(),
                                           $("#recover-bip44").prop("checked"),
                                           1443657600);

        if(result.error_msg != '' )
        { 
            alert(result.error_msg);
            return false;
        }
        else return true;
    },
    setMaster: function()
    {
        var keySelector = $("#extkey-table tr.selected");
        if( !keySelector.length )
        {
            alert("Please select a key to set it as master.");
            return false;
        }

        selected = $("#extkey-table tr.selected").attr("data-value").trim();
        if(selected != undefined && selected != "")
        {
            result = bridge.extKeySetMaster(selected);
            if(result.error_msg != '' )
            { 
                alert(result.error_msg);
                return false;
            }
            else
            {
                keyManagementPage.updateKeyList();
            }
        }
        else
        {
            alert("Select a key from the table to set a Master.");
            return false;
        }
    },
    setDefault: function()
    {
        var accSelector = $("#extkey-account-table tr.selected");

        if( !accSelector.length )
        {
            alert("Please select an account to set it as default.");
            return false;
        }

        selected = $("#extkey-account-table tr.selected").attr("data-value").trim();
        if(selected != undefined && selected != "")
        {
            result = bridge.extKeySetDefault(selected);
            if(result.error_msg != '' )
            { 
                alert(result.error_msg);
                return false;
            }
            else
            {
                keyManagementPage.updateAccountList();
            }
        }
        else
        {
            alert("Select an account from the table to set a default.");
            return false;
        }
    },
    changeActiveFlag: function()
    {
        var forAcc = false;

        //Check whats selected - if anything.
        var accSelector = $("#extkey-account-table tr.selected");
        var keySelector = $("#extkey-table tr.selected");
        if( !accSelector.length && !keySelector.length )
        {
            alert("Please select an account or key to change the active status.");
            return false;
        }

        if( accSelector.length )
        {
            selected = accSelector.attr("data-value").trim();
            active   = accSelector.attr("active-flag").trim();
            forAcc   = true;
        }
        else
        {
            selected = keySelector.attr("data-value").trim();
            active   = keySelector.attr("active-flag").trim();
        }

        if(selected != undefined && selected != "")
        {
            result = bridge.extKeySetActive(selected, active);
            if(result.error_msg != '' )
            { 
                alert(result.error_msg);
                return false;
            }
            else
            {
                if(forAcc)
                {
                    keyManagementPage.updateAccountList();
                }
                else
                {
                    keyManagementPage.updateKeyList();
                }
            }
        }
        else
        {
            alert("Please select an account or key to change the active status.");
            return false;
        }
    }
}

function setupWizard(section) {

    var steps = $("#" + section + " > div");

    // I just did this to make using 's and "s easier in the below prepend and append.
    backbtnjs = '$("#key-options").show(); $("#wizards").hide();';
    fwdbtnjs  = 'gotoWizard("new-key-wizard", 1);';
    $("#" + section).prepend("<div id='backWiz' class='wizardback' onclick='" + backbtnjs + "' ></div>")
    $("#" + section).prepend("<div id='fwdWiz'  class='wizardfwd'  onclick='" + fwdbtnjs  + "' ></div>")

    steps.each(function (i) {
            $(this).addClass("step" + i)
            $(this).hide();
        }
    );
}

function gotoWizard(section, step, runStepJS) {
    // Hide all wizards 
    var sections = $("#wizards > div"); 

    // Run validation on the wizard step - any error messages can be set there as well
    // TODO:  enhance these wizard functions to cater for validation fields etc.
    validateJS = $("#" + section + " .step" + (step - 1) ).attr("validateJS");

    // We check runStepJS because we must only validate when moving forward in the wizard
    if(runStepJS && validateJS != undefined)
    {
        var valid = eval(validateJS);
        if(!valid) {return false;}
    }

    sections.each(function (i) {
        $(this).hide();
        sections.width( $("#keymanagement > .bottom").width() - 100 );
    })

    var steps = $("#" + section + " > div[class^=step]");
    var gotoStep = step;
    if (gotoStep == null) { gotoStep = 0; }

    if(gotoStep == 0) {
        $("#" + section + " #backWiz").attr( 'onclick', '$("#key-options").show(); $("#wizards").hide();' )
        $("#" + section + " #fwdWiz").attr( 'onclick', 'gotoWizard("' + section + '", 1, true);' )
    }
    else
    {
        $("#" + section + " #backWiz").attr( 'onclick', 'gotoWizard("' + section + '", ' + (gotoStep - 1) + ' , false);' )
        $("#" + section + " #fwdWiz").attr( 'onclick',  'gotoWizard("' + section + '", ' + (gotoStep + 1) + ' , true);' )
    }

    // If we're at the end of the wizard then change the forward button to do whatever
    endWiz = $("#" + section + " .step" + (step) ).attr("endWiz");
    if(endWiz != undefined && endWiz != "")
    {
      $("#" + section + " #fwdWiz").attr( 'onclick',  endWiz );
    }

    // Hide all wizard steps - if we want cross wizards/steps etc.
    steps.each(function (i) {
        $(this).hide();
    });

    //Show the correct section and the step.
    $("#" + section).show();
    stepJS = $("#" + section + " .step" + gotoStep ).attr("stepJS");

    // Run the JS we want for this step we're about to start - 
    if(runStepJS && stepJS != undefined)
    {
        eval(stepJS);
    }    
    $("#" + section + " .step" + gotoStep ).fadeIn(500);
}
