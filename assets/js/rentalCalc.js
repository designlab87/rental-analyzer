function PVCalc(money,interest,n){
    return money / (Math.pow(1+interest,n));
}

function IRRCalc(CArray) {
    var min = -1.0;
    var max = 1.0;
    var guess = (min + max) / 2;
    var lastGuess = 1.0;
    var notSame = true;
    var NPV = 0;
    do {
        NPV = 0;
        guess = (min + max) / 2;
        if (Math.abs(lastGuess-guess)<0.0000000000000000001) notSame = false
        lastGuess = guess;
        for (var j=0; j<CArray.length; j++) {
            NPV += PVCalc(CArray[j],guess,j);
        }
        if (NPV > 0) {
            min = guess;
        } else {
            max = guess;
        }
    } while(notSame && (Math.abs(NPV) > 0.0000000000000000001));
    var raw = parseFloat(guess * 100).toFixed(2);
    return parseFloat(raw);
}

$(function(){
    $('input[type=radio][name=fundMethod]').change(function(){
        if(this.value == '1'){
            $('.methodControl').show();
        }else if(this.value == '0'){
            $('.methodControl').hide();
        }
    });
    $('input[type=radio][name=repairs]').change(function(){
        if(this.value == '1'){
            $('.repairsControl').show();
        }else if(this.value == '0'){
            $('.repairsControl').hide();
        }
    });
    $('input[type=radio][name=sellprice]').change(function(){
        if(this.value == '1'){
            $('.sellprice1Control').show();
            $('.sellprice2Control').hide();
        }else if(this.value == '0'){
            $('.sellprice1Control').hide();
            $('.sellprice2Control').show();
        }
    });
});


function calc(){
	
	//refresh the ui
	showChart();
	$('#detailBody').html('');
	
	//get the inputs
	var purchasePrice = parseNumeric($('#purchasePrice').val());
	var fundMethod = parseInt($("input[name='fundMethod']:checked").val());
	var downPayment = parseNumeric($('#downPayment').val());
    var loanRate = parseNumeric($('#loanRate').val());
    var loanYears = parseNumeric($('#loanYears').val());
    var closingCost = parseNumeric($('#closingCost').val());
	var repairs = parseInt($("input[name='repairs']:checked").val());
    var repairCost = parseNumeric($('#repairCost').val());
    var repairValue = parseNumeric($('#repairValue').val());
    var propertyTax = parseNumeric($('#propertyTax').val());
    var propertyTaxInc = parseNumeric($('#propertyTaxInc').val());
    var insurance = parseNumeric($('#insurance').val());
    var insuranceInc = parseNumeric($('#insuranceInc').val());
    var hoaFee = parseNumeric($('#hoaFee').val());
    var hoaFeeInc = parseNumeric($('#hoaFeeInc').val());
    var maintenance = parseNumeric($('#maintenance').val());
    var maintenanceInc = parseNumeric($('#maintenanceInc').val());
    var otherExp = parseNumeric($('#otherExp').val());
    var otherExpInc = parseNumeric($('#otherExpInc').val());
    var monthlyRent = parseNumeric($('#monthlyRent').val());
    var monthlyRentInc = parseNumeric($('#monthlyRentInc').val());
    var otherMonthly = parseNumeric($('#otherMonthly').val());
    var otherMonthlyInc = parseNumeric($('#otherMonthlyInc').val());
    var vacancyRate = parseNumeric($('#vacancyRate').val());
    var managementFee = parseNumeric($('#managementFee').val());
    var sellprice = parseInt($("input[name='sellprice']:checked").val());
    var salePrice = parseNumeric($('#salePrice').val());
    var valueAppreciation = parseNumeric($('#valueAppreciation').val());
    var holdingLength = parseNumeric($('#holdingLength').val());
    var costToSell = parseNumeric($('#costToSell').val());

	//do the math
    if(fundMethod == 1){
        var downPaymentAmount = purchasePrice * (downPayment/100);
        var monthly_payment = (purchasePrice - downPaymentAmount)*((loanRate/100)/12)*Math.pow((1+(loanRate/100)/12),(loanYears*12)) / (Math.pow((1+(loanRate/100)/12),(loanYears*12)) - 1);
    }else{
        var downPaymentAmount = 0;
        var monthly_payment = 0;
    }

	//set variables for amortization
	var data = [];
	var current_balance = (purchasePrice - downPaymentAmount);
	var payment_counter = 1;
	var total_interest = 0;
	//start amortization
    if(fundMethod == 1){
        while(current_balance > 0){
            var towards_interest = ((loanRate/100)/12) * current_balance;
            if(payment_counter == ((holdingLength * 12) +1)){
                //this is the next month after the full holding length. Time to sell it.
                var new_payment = current_balance + towards_interest;
                if(new_payment > current_balance){
                    new_payment = current_balance + towards_interest;
                }
                total_interest = total_interest + towards_interest;
                var towards_balance = new_payment - towards_interest;
                current_balance = current_balance - towards_balance;
                //populate data array
                var temp = ["SOLD",new_payment.toFixed(2),towards_balance.toFixed(2),towards_interest.toFixed(2),total_interest.toFixed(2),current_balance.toFixed(2)];
            }else{
                var new_payment = monthly_payment;
                if(new_payment > current_balance){
                    new_payment = current_balance + towards_interest;
                }
                total_interest = total_interest + towards_interest;
                var towards_balance = new_payment - towards_interest;
                current_balance = current_balance - towards_balance;
                //populate data array
                var temp = [payment_counter,new_payment.toFixed(2),towards_balance.toFixed(2),towards_interest.toFixed(2),total_interest.toFixed(2),current_balance.toFixed(2)];
            }
            data.push(temp);
            //increment
            payment_counter++;
        }
    }

    var annualPayments = [];
    var annualInterest = [];
    var annualBalance = [];
    var annualPrincPayments = [];
    var temp = -1;
    $.each(data,function(i,v){
        if(i % 12 === 0){
            temp++;
            annualPrincPayments[temp] = 0;
            annualPayments[temp] = 0;
            if(i > 1){
                annualBalance.push(parseFloat(data[i-1][5]));
                annualInterest.push(parseFloat(data[i-1][4]));
            }
        }
        annualPrincPayments[temp] += parseFloat(v[2]);
        annualPayments[temp] += parseFloat(v[1]);
    });

    if(fundMethod == 1){
        if(repairs == 1){
            var initialCash = downPaymentAmount + closingCost + repairCost;
        }else{
            var initialCash = downPaymentAmount + closingCost;
        }
    }else{
        if(repairs == 1){
            var initialCash = purchasePrice + closingCost + repairCost;
        }else{
            var initialCash = purchasePrice + closingCost;
        }
    }

    if(sellprice == 1){
        //calc appreciation rate from final sale dollar amount
        if(repairs == 1){
            var tempRate = IRR(salePrice,repairValue,holdingLength);
        }else{
            var tempRate = IRR(salePrice,purchasePrice,holdingLength);
        }
        var appreciationRate = tempRate/100;
    }else{
        //rate
        var appreciationRate = valueAppreciation/100;
    }

	//start the breakdown
    var breakdownArray = [];
    for (let index = 1; index <= holdingLength; index++) {
        var breakdown = {};
        breakdown.year = index;
        breakdown.mortgage = monthly_payment*12;
        breakdown.princPayment = annualPrincPayments[index-1];
        breakdown.balance = annualBalance[index-1];
        if(index == 1){
            breakdown.currentRent = monthlyRent;
            breakdown.currentOther = otherMonthly;
            breakdown.currentProp = propertyTax;
            breakdown.currentIns = insurance;
            breakdown.currentHoa = hoaFee;
            breakdown.currentMain = maintenance;
            breakdown.currentOExp = otherExp;

            if(repairs == 1){
                breakdown.currentValue = repairValue + (repairValue * appreciationRate);
            }else{
                breakdown.currentValue = purchasePrice + (purchasePrice * appreciationRate);
            }
            breakdown.revenue = (monthlyRent*12) + (otherMonthly*12);
            breakdown.income = breakdown.revenue - (breakdown.revenue * (vacancyRate/100));
            breakdown.income = breakdown.income - (breakdown.income * (managementFee/100));
            breakdown.expenses = propertyTax + insurance + hoaFee + maintenance + otherExp;
            if(fundMethod == 1){
                if(repairs == 1){
                    breakdown.equity = (repairValue * appreciationRate) + ((repairValue - purchasePrice) - repairCost) + (downPaymentAmount + repairCost) + annualPrincPayments[index-1];
                }else{
                    breakdown.equity = (purchasePrice * appreciationRate) + downPaymentAmount + annualPrincPayments[index-1];
                }
            }else{
                if(repairs == 1){
                    breakdown.equity = (repairValue * appreciationRate) + (repairValue - purchasePrice) + repairValue;
                }else{
                    breakdown.equity = (purchasePrice * appreciationRate) + purchasePrice;
                }
            }
            //var rate = IRR(fv,pv,years);
        }else{
            breakdown.currentRent = (breakdownArray[index-2]['currentRent']+(breakdownArray[index-2]['currentRent']*(monthlyRentInc/100)));
            breakdown.currentOther = (breakdownArray[index-2]['currentOther']+(breakdownArray[index-2]['currentOther']*(otherMonthlyInc/100)));
            breakdown.currentProp = (breakdownArray[index-2]['currentProp']+(breakdownArray[index-2]['currentProp']*(propertyTaxInc/100)));
            breakdown.currentIns = (breakdownArray[index-2]['currentIns']+(breakdownArray[index-2]['currentIns']*(insuranceInc/100)));
            breakdown.currentHoa = (breakdownArray[index-2]['currentHoa']+(breakdownArray[index-2]['currentHoa']*(hoaFeeInc/100)));
            breakdown.currentMain = (breakdownArray[index-2]['currentMain']+(breakdownArray[index-2]['currentMain']*(maintenanceInc/100)));
            breakdown.currentOExp = (breakdownArray[index-2]['currentOExp']+(breakdownArray[index-2]['currentOExp']*(otherExpInc/100)));

            breakdown.currentValue = breakdownArray[index-2]['currentValue'] + (breakdownArray[index-2]['currentValue'] * appreciationRate);
            breakdown.revenue = (breakdown.currentRent*12) + (breakdown.currentOther*12);
            breakdown.income = breakdown.revenue - (breakdown.revenue * (vacancyRate/100));
            breakdown.income = breakdown.income - (breakdown.income * (managementFee/100));
            breakdown.expenses = breakdown.currentProp + breakdown.currentIns + breakdown.currentHoa + breakdown.currentMain + breakdown.currentOExp;
            if(fundMethod == 1){
                breakdown.equity = breakdownArray[index-2]['equity'] + ((breakdownArray[index-2]['currentValue'] * appreciationRate) + annualPrincPayments[index-1]);
            }else{
                breakdown.equity = breakdownArray[index-2]['equity'] + (breakdownArray[index-2]['currentValue'] * appreciationRate);
            }
        }
        breakdown.cashflow = breakdown.income - (breakdown.mortgage + breakdown.expenses);
        breakdown.cashoncash = (breakdown.cashflow/initialCash)*100;
        if(fundMethod == 1){
            breakdown.cashreceive = (breakdown.currentValue - (breakdown.currentValue * (costToSell/100))) - annualBalance[index-1];
        }else{
            breakdown.cashreceive = (breakdown.currentValue - (breakdown.currentValue * (costToSell/100)));
        }
        breakdown.noi = breakdown.cashflow + breakdown.mortgage;

        var totalCashFlow = [];
        totalCashFlow.push(-Math.abs(initialCash));
        $.each(breakdownArray,function(i,v){
            totalCashFlow.push(v['cashflow']);
        });
        totalCashFlow.push(breakdown.cashflow + breakdown.cashreceive);
        breakdown.irrArray = totalCashFlow;
        breakdown.irr = IRRCalc(totalCashFlow);

        if(index == holdingLength){
            breakdown.cashflow = breakdown.cashflow + breakdown.cashreceive;
        }

        breakdownArray.push(breakdown);
        //console.log(breakdown.cashflow);
        //console.log(initialCash);
    }

    var totalRow = {"year":'Total',"income":0, "mortgage":0, "expenses":0, "cashflow":-Math.abs(initialCash), "cashoncash":0, "equity":'', "cashreceive":'', "irr":''};
    $.each(breakdownArray,function(i,v){
        totalRow.income += v.income;
        totalRow.mortgage += v.mortgage;
        totalRow.expenses += v.expenses;
        totalRow.cashflow += v.cashflow;
    });
    totalRow.cashoncash = (totalRow.cashflow/initialCash)*100;
    breakdownArray.push(totalRow);

    //console.log(breakdownArray);
	
	//write the conclusion sentence
	var sentence = "The Compound Annual Growth Rate (CAGR) on this deal, with an initial upfront investment of "+formatCurrency(initialCash)+" over "+holdingLength+" years is";
	
    //console.log(breakdownArray[breakdownArray.length-2]['cashflow']);
    //console.log(initialCash);
    //console.log(holdingLength);
    //console.log(equivalentCompoundRate);

    if(breakdownArray[breakdownArray.length-2]['cashflow'] >= breakdownArray[breakdownArray.length-1]['cashflow']){
	    var equivalentCompoundRate = IRR(breakdownArray[breakdownArray.length-2]['cashflow'], initialCash, holdingLength);
    }else{
    	var equivalentCompoundRate = IRR(breakdownArray[breakdownArray.length-1]['cashflow'], initialCash, holdingLength);
    }

	//draw the ui
	$('#answerSentence').html(sentence);
	$('#answerDisplay').html(equivalentCompoundRate.toFixed(2)+'% per year');
	
	//prep the chart
	$('#calc-toolbar').show();
	
	//prep the details
    //<tr><td>Cash to Receive</td><td style="margin-right:20px;">Return (IRR)</td></tr>
    //<colgroup><col col="1" width="90px"/><col col="2" width="90px"/><col col="3" width="90px"/><col col="4" width="90px"/><col col="5" width="90px"/><col col="6" width="90px"/><col col="7" width="90px"/><col col="8" width="11.11%"/><col col="9" width="11.11%"/></colgroup>
	$('#calc-detail').html('<div style="overflow-y:auto;"><div style="width:1228px;"><table class="table table-condensed table-bordered table-striped mb-0"><colgroup><col col="1" width="11.11%"/><col col="2" width="11.11%"/><col col="3" width="11.11%"/><col col="4" width="11.11%"/><col col="5" width="11.11%"/><col col="6" width="11.11%"/><col col="7" width="11.11%"/><col col="8" width="11.11%"/><col col="9" width="11.11%"/></colgroup><thead><tr><td class="text-center" rowspan="2">Year</td><td class="text-center" rowspan="2">Annual Income</td><td class="text-center" rowspan="2">Mortgage</td><td class="text-center" rowspan="2">Expenses</td><td class="text-center" rowspan="2">Cash Flow</td><td class="text-center" rowspan="2">Cash on Cash Return</td><td class="text-center" rowspan="2">Equity Accumulated</td><td class="text-center" colspan="2">If Sold at Year End</td></tr><tr><td align="center">Cash to Receive</td><td align="center">Return (IRR)</td></tr></thead></table><div id="calc-detail-inner"><table id="breakdownTable" class="table table-condensed table-striped calc-table-hover mb-0"><colgroup><col col="1" width="11.11%"/><col col="2" width="11.11%"/><col col="3" width="11.11%"/><col col="4" width="11.11%"/><col col="5" width="11.11%"/><col col="6" width="11.11%"/><col col="7" width="11.11%"/><col col="8" width="11.11%"/><col col="9" width="11.11%"/></colgroup><thead style="display:none;"><tr><td class="text-center" rowspan="2">Yr</td><td class="text-center" rowspan="2">Income</td><td class="text-center" rowspan="2">Mortgage</td><td class="text-center" rowspan="2">Expenses</td><td class="text-center" rowspan="2">Cash Flow</td><td class="text-center" rowspan="2">Cash on Cash</td><td class="text-center" rowspan="2">Equity</td><td class="text-center" colspan="2">If Sold at Year End</td></tr><tr><td align="center">Cash to Receive</td><td align="center">Return (IRR)</td></tr></thead><tbody class="detailBody"></tbody></table></div></div>');
    $('.detailBody').append('<tr><td class="text-center">Begin</td><td class="text-right"></td><td class="text-right"></td><td class="text-right"></td><td class="text-right">-'+formatCurrency(initialCash)+'</td><td class="text-right"></td><td class="text-right"></td><td class="text-right"></td><td class="text-right"></td></tr>');
	$.each(breakdownArray, function(i,v){
        if(i == (breakdownArray.length-1)){
            var string = '<tr style="font-weight:500;"><td class="text-center">'+v.year+'</td><td class="text-right">'+formatCurrency(v.income)+'</td><td class="text-right">'+formatCurrency(v.mortgage)+'</td><td class="text-right">'+formatCurrency(v.expenses)+'</td><td class="text-right">'+formatCurrency(v.cashflow)+'</td><td class="text-right">'+v.cashoncash.toFixed(2)+'%</td><td class="text-right"></td><td class="text-right"></td><td class="text-right"></td></tr>';
        }else{
            var string = '<tr><td class="text-center">'+v.year+'</td><td class="text-right">'+formatCurrency(v.income)+'</td><td class="text-right">'+formatCurrency(v.mortgage)+'</td><td class="text-right">'+formatCurrency(v.expenses)+'</td><td class="text-right">'+formatCurrency(v.cashflow)+'</td><td class="text-right">'+v.cashoncash.toFixed(2)+'%</td><td class="text-right">'+formatCurrency(v.equity)+'</td><td class="text-right">'+formatCurrency(v.cashreceive)+'</td><td class="text-right">'+v.irr+'%</td></tr>';
        }
		$('.detailBody').append(string);
	});

    $('#chart').html('<div class="row"><div class="col-md-6"><h4>For the '+holdingLength+' Years Invested</h4><table id="overviewTable" class="table table-condensed"><tbody><tr style="display:none;font-weight:500;"><td>Compound Annual Growth Rate (CAGR):</td><td id="d_irr">'+equivalentCompoundRate.toFixed(2)+'%</td></tr><tr style="font-weight:500;"><td>Internal Rate of Return (IRR):</td><td id="d_cagr">'+breakdownArray[breakdownArray.length-2]['irr']+'%</td></tr><tr style="font-weight:500;"><td>Total Profit when Sold:</td><td id="d_profit">'+formatCurrency(breakdownArray[breakdownArray.length-1]['cashflow'])+'</td></tr><tr style="font-weight:500;"><td>Cash on Cash Return:</td><td id="d_ccr">'+breakdownArray[breakdownArray.length-1]['cashoncash'].toFixed(2)+'%</td></tr><tr style="font-weight:500;"><td>Capitalization Rate:</td><td id="d_cr">'+((breakdownArray[0]['noi']/purchasePrice)*100).toFixed(2)+'%</td></tr><tr><td>Total Rental Income:</td><td id="d_ri">'+formatCurrency(breakdownArray[breakdownArray.length-1]['income'])+'</td></tr><tr><td>Total Mortgage Payments:</td><td id="d_mp">'+formatCurrency(breakdownArray[breakdownArray.length-1]['mortgage'])+'</td></tr><tr><td>Total Expenses:</td><td id="d_exp">'+formatCurrency(breakdownArray[breakdownArray.length-1]['expenses'])+'</td></tr><tr><td>Total Net Operating Income:</td><td id="d_noi">'+formatCurrency(breakdownArray[breakdownArray.length-1]['income'] - breakdownArray[breakdownArray.length-1]['expenses'])+'</td></tr></tbody></table></div><div class="col-md-6"><h4>First Year Income and Expense</h4><table id="firstYearTable" class="table table-sm table-bordered table-condensed"><thead><tr><td></td><td style="font-weight:500;">Monthly</td><td style="font-weight:500;">Annual</td></tr></thead><tbody><tr><td>Income:</td><td>'+formatCurrency((monthlyRent+otherMonthly))+'</td><td>'+formatCurrency((monthlyRent+otherMonthly)*12)+'</td></tr><tr><td>Mortgage:</td><td>'+formatCurrency(breakdownArray[0]['mortgage']/12)+'</td><td>'+formatCurrency(breakdownArray[0]['mortgage'])+'</td></tr><tr><td>Vacancy:</td><td>'+formatCurrency(monthlyRent*(vacancyRate/100))+'</td><td>'+formatCurrency((monthlyRent*12)*(vacancyRate/100))+'</td></tr><tr><td>Property Tax:</td><td>'+formatCurrency(propertyTax/12)+'</td><td>'+formatCurrency(propertyTax)+'</td></tr><tr><td>Insurance:</td><td>'+formatCurrency(insurance/12)+'</td><td>'+formatCurrency(insurance)+'</td></tr><tr><td>Maintenance:</td><td>'+formatCurrency(maintenance/12)+'</td><td>'+formatCurrency(maintenance)+'</td></tr><tr><td>Other Cost:</td><td>'+formatCurrency(otherExp/12)+'</td><td>'+formatCurrency(otherExp)+'</td></tr><tr><td style="font-weight:500;">Cash Flow:</td><td style="font-weight:500;">'+formatCurrency(breakdownArray[0]['cashflow']/12)+'</td><td style="font-weight:500;">'+formatCurrency(breakdownArray[0]['cashflow'])+'</td></tr><tr><td>Net Operating Income:</td><td>'+formatCurrency(breakdownArray[0]['noi']/12)+'</td><td>'+formatCurrency(breakdownArray[0]['noi'])+'</td></tr></tbody></table></div></div>');

    if(fundMethod == 1){
        $('#graph').html('<table class="table table-condensed table-striped" style="margin-bottom:0px;"><colgroup><col col="1" width="5%"/><col col="2" width="19%"/><col col="3" width="19%"/><col col="4" width="19%"/><col col="5" width="19%"/><col col="6" width="19%"/></colgroup><thead><tr><td id="period" style="text-align:center;font-weight:500;">Month</td><td style="text-align:center;font-weight:500;">Payment</td><td style="text-align:center;font-weight:500;">Towards Principal</td><td style="text-align:center;font-weight:500;">Towards Interest</td><td style="text-align:center;font-weight:500;">Total Interest</td><td style="text-align:center;font-weight:500;">Balance</td></tr></thead></table><div id="calc-detail-inner"><table id="loanAmortizationTable" class="table table-condensed table-striped calc-table-hover"><colgroup><col col="1" width="5%"/><col col="2" width="19%"/><col col="3" width="19%"/><col col="4" width="19%"/><col col="5" width="19%"/><col col="6" width="19%"/></colgroup><thead style="display:none;"><tr><td id="period" style="text-align:center;font-weight:500;">Month</td><td style="text-align:center;font-weight:500;">Payment</td><td style="text-align:center;font-weight:500;">Towards Principal</td><td style="text-align:center;font-weight:500;">Towards Interest</td><td style="text-align:center;font-weight:500;">Total Interest</td><td style="text-align:center;font-weight:500;">Balance</td></tr></thead><tbody id="graphDetailBody"></tbody></table></div>');
        $.each(data, function(i,v){
            if(i == data.length-1){
                var string = "<tr><td style='text-align:center;font-weight:500;'>"+v[0]+"</td><td style='text-align:center;font-weight:500;'>"+formatCurrency(v[1])+"</td><td style='text-align:center;font-weight:500;'>"+formatCurrency(v[2])+"</td><td style='text-align:center;font-weight:500;'>"+formatCurrency(v[3])+"</td><td style='text-align:center;font-weight:500;'>"+formatCurrency(v[4])+"</td><td style='text-align:center;font-weight:500;'>"+formatCurrency(v[5])+"</td></tr>";
                $('#graphDetailBody').append(string);
            }else{
                var string = "<tr><td style='text-align:center;'>"+v[0]+"</td><td style='text-align:center;'>"+formatCurrency(v[1])+"</td><td style='text-align:center;'>"+formatCurrency(v[2])+"</td><td style='text-align:center;'>"+formatCurrency(v[3])+"</td><td style='text-align:center;'>"+formatCurrency(v[4])+"</td><td style='text-align:center;'>"+formatCurrency(v[5])+"</td></tr>";
                $('#graphDetailBody').append(string);
            }
        });
        $('#calc-graph-button').show();
    }else{
        $('#calc-graph-button').hide();
    }

}

function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/jpeg");

    return dataURL;
    //return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function createReport(){
    // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
    var doc = new jsPDF('portrait','mm','letter');
    var totalPagesExp = "{total_pages_count_string}";

    //add new page function
    function addNewPage(num){
        //doc.addPage();
        // Content must fit in remaining area, between 40 down and 255 down
        // By rect -> 15.5, 40, 185, 225
        // -------- START HEADER ----------
        doc.setFont("helvetica");
        doc.setFontSize(30);
        doc.setFontType("bold");
        doc.text(15.5, 33, "Rental Property Deal Analyzer");
        doc.setFontSize(9);
        doc.setFontType("normal");
        doc.text(15.5, 40, "produced by the Rental Property Deal Analyzer at https://github.com/designlab87");

        doc.setLineWidth(0.5);
        doc.line(15.5, 268, 200.5, 268);
        doc.setFont("helvetica");
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.setFontType("normal");
        doc.text(72, 273, "\u00A9 "+new Date().getFullYear()+" Rental Property Deal Analyzer");
        // Footer
        var str = "Page " + doc.internal.getNumberOfPages()
        // Total page number plugin only available in jspdf v1.0+
        if (typeof doc.putTotalPages === 'function') {
            str = str + " of " + totalPagesExp;
        }
        doc.setFontSize(10);

        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        var pageSize = doc.internal.pageSize;
        var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, 15.5, pageHeight - 7);
        // -------- END HEADER ----------
    }

    var asmntFileName = 'Rental Property Deal';

    // =================== START COVER PAGE ====================

    //doc.addImage(logoImg, 'JPEG', 15.5, 142, 185, 121); //from presaved data url

    // =================== START PAGE 1 ====================
    addNewPage(1);

	//get the form inputs
    var purchaseDesc = $('#purchaseDesc').val();
	var purchasePrice = parseNumeric($('#purchasePrice').val());
	var fundMethod = parseInt($("input[name='fundMethod']:checked").val());
	var downPayment = parseNumeric($('#downPayment').val());
    var loanRate = parseNumeric($('#loanRate').val());
    var loanYears = parseNumeric($('#loanYears').val());
    var closingCost = parseNumeric($('#closingCost').val());
	var repairs = parseInt($("input[name='repairs']:checked").val());
    var repairCost = parseNumeric($('#repairCost').val());
    var repairValue = parseNumeric($('#repairValue').val());
    var propertyTax = parseNumeric($('#propertyTax').val());
    var propertyTaxInc = parseNumeric($('#propertyTaxInc').val());
    var insurance = parseNumeric($('#insurance').val());
    var insuranceInc = parseNumeric($('#insuranceInc').val());
    var hoaFee = parseNumeric($('#hoaFee').val());
    var hoaFeeInc = parseNumeric($('#hoaFeeInc').val());
    var maintenance = parseNumeric($('#maintenance').val());
    var maintenanceInc = parseNumeric($('#maintenanceInc').val());
    var otherExp = parseNumeric($('#otherExp').val());
    var otherExpInc = parseNumeric($('#otherExpInc').val());
    var monthlyRent = parseNumeric($('#monthlyRent').val());
    var monthlyRentInc = parseNumeric($('#monthlyRentInc').val());
    var otherMonthly = parseNumeric($('#otherMonthly').val());
    var otherMonthlyInc = parseNumeric($('#otherMonthlyInc').val());
    var vacancyRate = parseNumeric($('#vacancyRate').val());
    var managementFee = parseNumeric($('#managementFee').val());
    var sellprice = parseInt($("input[name='sellprice']:checked").val());
    var salePrice = parseNumeric($('#salePrice').val());
    var valueAppreciation = parseNumeric($('#valueAppreciation').val());
    var holdingLength = parseNumeric($('#holdingLength').val());
    var costToSell = parseNumeric($('#costToSell').val());

    doc.setFontSize(11);
    doc.setFontType("bold");
    doc.text(15.5, 50, "Property Purchase Details");
    doc.setFontSize(9);
    doc.setFontType("normal");
    doc.text(15.5, 55, "PROPERTY DESCRIPTION: "+purchaseDesc);
    doc.text(15.5, 59, "PURCHASE PRICE: "+formatCurrency(purchasePrice));
    if(fundMethod == 1){
        doc.text(15.5, 63, "FINANCED: Yes");
        doc.text(45, 63, "DOWN PAYMENT: "+downPayment+"%");
        doc.text(85, 63, "LOAN RATE: "+loanRate+"%");
        doc.text(120, 63, "LOAN TERM: "+loanYears);
    }else{
        doc.text(15.5, 63, "FINANCED: No");
    }
    doc.text(15.5, 67, "CLOSING COSTS: "+formatCurrency(closingCost));
    if(repairs == 1){
        doc.text(15.5, 71, "MAKING REPAIRS: Yes");
        doc.text(55, 71, "REPAIR COST: "+formatCurrency(repairCost));
        doc.text(100, 71, "VALUE AFTER: "+formatCurrency(repairValue));
    }else{
        doc.text(15.5, 71, "MAKING REPAIRS: No");
    }
    doc.setFontSize(11);
    doc.setFontType("bold");
    doc.text(15.5, 78, "Expense Details");
    doc.setFontSize(9);
    doc.setFontType("normal");
    doc.autoTable({
        theme: 'plain',
        styles: {fontSize: 8.5, cellPadding: 0.5, fillColor: '#ffffff', textColor: '#000000', lineWidth: 0.25},
        head: [['', 'Annual', 'Increase']],
        body: [
            ['Property Tax', formatCurrency(propertyTax), propertyTaxInc+"%"],
            ['Insurance', formatCurrency(insurance), insuranceInc+"%"],
            ['HOA Fee', formatCurrency(hoaFee), hoaFeeInc+"%"],
            ['Maintenance', formatCurrency(maintenance), maintenanceInc+"%"],
            ['Other Costs', formatCurrency(otherExp), otherExpInc+"%"],
        ],
        startY: 80,
        tableWidth: 85
    });
    doc.setFontSize(11);
    doc.setFontType("bold");
    doc.text(105, 78, "Income Details");
    doc.setFontSize(9);
    doc.setFontType("normal");
    doc.autoTable({
        theme: 'plain',
        styles: {fontSize: 8.5, cellPadding: 0.5, fillColor: '#ffffff', textColor: '#000000', lineWidth: 0.25},
        head: [['', '', 'Increase']],
        body: [
            ['Monthly Rent', formatCurrency(monthlyRent), monthlyRentInc+"%"],
            ['Other Monthly Income', formatCurrency(otherMonthly), otherMonthlyInc+"%"],
        ],
        margin: 105,
        startY: 80,
        tableWidth: 85
    });
    doc.text(105, 99, "VACANCY RATE: "+vacancyRate+"%");
    doc.text(150, 99, "MANAGEMENT FEE: "+managementFee+"%");
    if(sellprice == 1){
        doc.text(105, 103, "KNOWN SALE PRICE: Yes");
        doc.text(150, 103, "SALE PRICE: "+formatCurrency(salePrice));
    }else{
        doc.text(105, 103, "KNOWN SALE PRICE: No");
        doc.text(150, 103, "VALUE APPRECIATION: "+valueAppreciation+"%");
    }
    doc.text(105, 107, "HOLDING LENGTH: "+holdingLength+" yrs");
    doc.text(150, 107, "COST TO SELL: "+costToSell+"%");






    //print Overview table
    doc.setFontSize(18);
    doc.setFontType("bold");
    doc.text(15.5, 120, "For the total time invested");
    doc.autoTable({
        headStyles: {fillColor: '#27a243',fontSize: 7,halign: 'center',lineWidth:0.25,lineColor:'#ffffff'},
        columnStyles: {0: {cellWidth: 10, halign: 'center', fontSize: 8}, 1: {cellWidth: 20, halign: 'center', fontSize: 8}},
        html: '#overviewTable',
        allSectionHooks: true,
        startY: 122,
        didDrawPage: function (data) {
            doc.setLineWidth(0.5);
            doc.line(15.5, 268, 200.5, 268);
            doc.setFont("helvetica");
            doc.setTextColor(0);
            doc.setFontSize(10);
            doc.setFontType("normal");
            doc.text(72, 273, "\u00A9 "+new Date().getFullYear()+" Rental Property Deal Analyzer");
            // Footer
            var str = "Page " + doc.internal.getNumberOfPages()
            // Total page number plugin only available in jspdf v1.0+
            if (typeof doc.putTotalPages === 'function') {
                str = str + " of " + totalPagesExp;
            }
            doc.setFontSize(10);

            // jsPDF 1.4+ uses getWidth, <1.4 uses .width
            var pageSize = doc.internal.pageSize;
            var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, 15.5, pageHeight - 7);
        },
    });

    //print First Year table
    doc.setFontSize(18);
    doc.setFontType("bold");
    doc.text(15.5, doc.lastAutoTable.finalY+10, "First Year Income and Expense");
    doc.autoTable({
        headStyles: {fillColor: '#27a243',fontSize: 7,halign: 'center',lineWidth:0.25,lineColor:'#ffffff'},
        columnStyles: {0: {cellWidth: 10, halign: 'center', fontSize: 8}, 1: {cellWidth: 20, halign: 'center', fontSize: 8}, 2: {cellWidth: 20, halign: 'center', fontSize: 8}},
        html: '#firstYearTable',
        allSectionHooks: true,
        startY: doc.lastAutoTable.finalY+12,
        didDrawPage: function (data) {
            doc.setLineWidth(0.5);
            doc.line(15.5, 268, 200.5, 268);
            doc.setFont("helvetica");
            doc.setTextColor(0);
            doc.setFontSize(10);
            doc.setFontType("normal");
            doc.text(72, 273, "\u00A9 "+new Date().getFullYear()+" Rental Property Deal Analyzer");
            // Footer
            var str = "Page " + doc.internal.getNumberOfPages()
            // Total page number plugin only available in jspdf v1.0+
            if (typeof doc.putTotalPages === 'function') {
                str = str + " of " + totalPagesExp;
            }
            doc.setFontSize(10);

            // jsPDF 1.4+ uses getWidth, <1.4 uses .width
            var pageSize = doc.internal.pageSize;
            var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, 15.5, pageHeight - 7);
        },
    });

    addNewPage(2);
    doc.addPage();

    //print Breakdown table
    doc.setFontSize(18);
    doc.setFontType("bold");
    doc.text(15.5, 15.5, "Deal Breakdown");
    doc.autoTable({
        headStyles: {fillColor: '#27a243',fontSize: 7,halign: 'center',lineWidth:0.25,lineColor:'#ffffff'},
        columnStyles: {0: {cellWidth: 10, halign: 'center', fontSize: 8}, 1: {cellWidth: 20, halign: 'center', fontSize: 8}, 2: {cellWidth: 20, halign: 'center', fontSize: 8}, 3: {cellWidth: 20, halign: 'center', fontSize: 8}, 4: {cellWidth: 20, halign: 'center', fontSize: 8}, 5: {cellWidth: 20, halign: 'center', fontSize: 8}, 6: {cellWidth: 20, halign: 'center', fontSize: 8}, 7: {cellWidth: 20, halign: 'center', fontSize: 8}, 8: {cellWidth: 20, halign: 'center', fontSize: 8}},
        html: '#breakdownTable',
        allSectionHooks: true,
        // Use for customizing texts or styles of specific cells after they have been formatted by this plugin.
        // This hook is called just before the column width and other features are computed.
        didParseCell: function(data) {
            if (data.row.index === (data.length-1)) {
                data.cell.styles.fontStyle = 'bold';
            }
        },
        startY: 17.5,
        didDrawPage: function (data) {
            doc.setLineWidth(0.5);
            doc.line(15.5, 268, 200.5, 268);
            doc.setFont("helvetica");
            doc.setTextColor(0);
            doc.setFontSize(10);
            doc.setFontType("normal");
            doc.text(72, 273, "\u00A9 "+new Date().getFullYear()+" Rental Property Deal Analyzer");
            // Footer
            var str = "Page " + doc.internal.getNumberOfPages()
            // Total page number plugin only available in jspdf v1.0+
            if (typeof doc.putTotalPages === 'function') {
                str = str + " of " + totalPagesExp;
            }
            doc.setFontSize(10);

            // jsPDF 1.4+ uses getWidth, <1.4 uses .width
            var pageSize = doc.internal.pageSize;
            var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, 15.5, pageHeight - 7);
        },
    });

    if(fundMethod == 1){

        //print Loan Amortization table
        doc.setFontSize(18);
        doc.setFontType("bold");
        doc.text(15.5, doc.lastAutoTable.finalY+10, "Loan Amortization");
        doc.autoTable({
            headStyles: {fillColor: '#27a243',fontSize: 7,halign: 'center',lineWidth:0.25,lineColor:'#ffffff'},
            columnStyles: {0: {cellWidth: 10, halign: 'center', fontSize: 8}, 1: {cellWidth: 20, halign: 'center', fontSize: 8}, 2: {cellWidth: 20, halign: 'center', fontSize: 8}, 3: {cellWidth: 20, halign: 'center', fontSize: 8}, 4: {cellWidth: 20, halign: 'center', fontSize: 8}, 5: {cellWidth: 20, halign: 'center', fontSize: 8}},
            html: '#loanAmortizationTable',
            startY: doc.lastAutoTable.finalY+12,
            didDrawPage: function (data) {
                doc.setLineWidth(0.5);
                doc.line(15.5, 268, 200.5, 268);
                doc.setFont("helvetica");
                doc.setTextColor(0);
                doc.setFontSize(10);
                doc.setFontType("normal");
                doc.text(72, 273, "\u00A9 "+new Date().getFullYear()+" Rental Property Deal Analyzer");
                // Footer
                var str = "Page " + doc.internal.getNumberOfPages()
                // Total page number plugin only available in jspdf v1.0+
                if (typeof doc.putTotalPages === 'function') {
                    str = str + " of " + totalPagesExp;
                }
                doc.setFontSize(10);

                // jsPDF 1.4+ uses getWidth, <1.4 uses .width
                var pageSize = doc.internal.pageSize;
                var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                doc.text(str, 15.5, pageHeight - 7);
            },
        });

    }

    // Total page number plugin only available in jspdf v1.0+
    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
    }

    //save with name
    doc.save(asmntFileName+'.pdf');
}

$(document).ready(function(){
	
});
