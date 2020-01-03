



// ============================================================

// START FINANCIAL FUNCTIONS

// ============================================================



function calcIncomeTax(income,status){

	

	if(isNaN(status)){status = 0;}

	

	var totalTax = 0;

	var marginalRate = 0;

	var effectiveRate = 0;

	

	//2014

	//var statusArray = [

	//	[0,9075,36900,89350,186350,405100,406750], //single

	//	[0,18150,73800,148850,226850,405100,457600], //married filing jointly or qualifying widow(er)

	//	[0,9075,36900,74425,113425,202550,228800], //married filing seperately

	//	[0,12950,49400,127550,206600,405100,432200] //head of household

	//];

	

	//2016

	var statusArray = [

		[0,9275,37650,91150,190150,413350,415050], //single

		[0,18550,75300,151900,231450,413350,466950], //married filing jointly or qualifying widow(er)

		[0,9275,37650,75950,115725,206675,233475], //married filing separately

		[0,13250,50400,130150,210800,413350,441000] //head of household

	];

	

	var rateArray = [10,15,25,28,33,35,39.6];

	

	var detailsArray = [];

	

	for(var i = 0, len = statusArray[status].length; i < len; i++){

		if((income > statusArray[status][i] && income > statusArray[status][i+1]) || (income > statusArray[status][i] && income > statusArray[status][statusArray[status].length-1])){

			if((i+1) == statusArray[status].length){

				totalTax += (income - statusArray[status][i]) * (rateArray[i]/100);

				marginalRate = rateArray[i];

				effectiveRate = parseFloat(((totalTax/income)*100).toFixed(2));

				var detailsObj = {bracket:formatCurrency(statusArray[status][i])+'+',amount:formatCurrency(income - statusArray[status][i]),rate:rateArray[i]+'%',sum:formatCurrency(totalTax),tax:formatCurrency((income - statusArray[status][i]) * (rateArray[i]/100))};

				detailsArray.push(detailsObj);

				//console.log('i3:'+i+', bracket:'+statusArray[status][i]+', eff:'+effectiveRate+', mar:'+marginalRate+', tax:'+totalTax+', added:'+(income - statusArray[status][i]) * (rateArray[i]/100));

			}else{

				totalTax += (statusArray[status][i+1] - statusArray[status][i]) * (rateArray[i]/100);

				var detailsObj = {bracket:formatCurrency(statusArray[status][i])+'-'+formatCurrency(statusArray[status][i+1]),amount:formatCurrency(Math.min(statusArray[status][i+1],income) - statusArray[status][i]),rate:rateArray[i]+'%',sum:formatCurrency(totalTax),tax:formatCurrency((statusArray[status][i+1] - statusArray[status][i]) * (rateArray[i]/100))};

				detailsArray.push(detailsObj);

				//console.log('i1:'+i+', bracket:'+statusArray[status][i]+', eff:'+effectiveRate+', mar:'+marginalRate+', tax:'+totalTax+', added:'+(statusArray[status][i+1] - statusArray[status][i]) * (rateArray[i]/100));

			}

		}

		if(income > statusArray[status][i] && income <= statusArray[status][i+1]){

			totalTax += (income - statusArray[status][i]) * (rateArray[i]/100);

			marginalRate = rateArray[i];

			effectiveRate = parseFloat(((totalTax/income)*100).toFixed(2));

			var detailsObj = {bracket:formatCurrency(statusArray[status][i])+'-'+formatCurrency(statusArray[status][i+1]),amount:formatCurrency(Math.min(statusArray[status][i+1],income) - statusArray[status][i]),rate:rateArray[i]+'%',sum:formatCurrency(totalTax),tax:formatCurrency((income - statusArray[status][i]) * (rateArray[i]/100))};

			detailsArray.push(detailsObj);

			//console.log('i2:'+i+', bracket:'+statusArray[status][i]+', eff:'+effectiveRate+', mar:'+marginalRate+', tax:'+totalTax+', added:'+(income - statusArray[status][i]) * (rateArray[i]/100));

			break;

		}

	}

	

	var tax = {

		totalTax:totalTax,

		marginalRate:marginalRate,

		effectiveRate:effectiveRate,

		detailsArray:detailsArray

	};

	

	return tax;

}



/****************************************************************

 FV of ORDINARY ANNUITY

 annuityFVsolveForTimeLong(fva,pmt,i,p)

 ---------------------------------------------------------------

 fva = Future Value of Annuity

 pmt = periodic payment

 i = interest rate

 p = payment timing (1 = beginning of period, 0 = end of period)

****************************************************************/

function annuityFVsolveForTimeLong(fva,pmt,i,p){

	var bal = 0;

	var n = 0;

	if(p == 1){ //beginning of period payments

		while((Math.round(Math.round(bal) / 10) * 10) < fva){

			bal = (pmt + bal) + ((pmt + bal) * (i / 100));

			n++;

		}

	}else{ //end of period payments

		while((Math.round(Math.round(bal) / 10) * 10) < fva){

			bal = bal + (bal * (i / 100)) + pmt;

			n++;

		}

	}

	return n;

}



// FV of ORDINARY ANNUITY - END of PERIOD PAYMENTS

// ===============================================

function annuityFVsolveForTime(fva,pmt,i){

	var n = Math.log(1 + ((fva / pmt) * (i / 100)))/Math.log(1 + (i / 100));

	return n;

}



function PV(rate,nper,pmt,fv,type){

	var pv = (((((Math.pow(1.00 + rate, nper) - 1))/rate) * (pmt * (1 + (rate * type)))) - fv) / (Math.pow(1.00+rate, nper));

	return pv;

}



function DPV(fv,r,t){

	return fv * Math.pow((1 + (r / 100)), -t);

}



//Internal Rate of Return

function IRRvalues(values, guess) {

  // Credits: algorithm inspired by Apache OpenOffice

  

  // Calculates the resulting amount

  var irrResult = function(values, dates, rate) {

    var r = rate + 1;

    var result = values[0];

    for (var i = 1; i < values.length; i++) {

      result += values[i] / Math.pow(r, (dates[i] - dates[0]) / 365);

    }

    return result;

  }



  // Calculates the first derivation

  var irrResultDeriv = function(values, dates, rate) {

    var r = rate + 1;

    var result = 0;

    for (var i = 1; i < values.length; i++) {

      var frac = (dates[i] - dates[0]) / 365;

      result -= frac * values[i] / Math.pow(r, frac + 1);

    }

    return result;

  }



  // Initialize dates and check that values contains at least one positive value and one negative value

  var dates = [];

  var positive = false;

  var negative = false;

  for (var i = 0; i < values.length; i++) {

    dates[i] = (i === 0) ? 0 : dates[i - 1] + 365;

    if (values[i] > 0) positive = true;

    if (values[i] < 0) negative = true;

  }

  

  // Return error if values does not contain at least one positive value and one negative value

  if (!positive || !negative) return '#NUM!';



  // Initialize guess and resultRate

  var guess = (typeof guess === 'undefined') ? 0.1 : guess;

  var resultRate = guess;

  

  // Set maximum epsilon for end of iteration

  var epsMax = 1e-10;

  

  // Set maximum number of iterations

  var iterMax = 50;



  // Implement Newton's method

  var newRate, epsRate, resultValue;

  var iteration = 0;

  var contLoop = true;

  do {

    resultValue = irrResult(values, dates, resultRate);

    newRate = resultRate - resultValue / irrResultDeriv(values, dates, resultRate);

    epsRate = Math.abs(newRate - resultRate);

    resultRate = newRate;

    contLoop = (epsRate > epsMax) && (Math.abs(resultValue) > epsMax);

  } while(contLoop && (++iteration < iterMax));



  if(contLoop) return '#NUM!';



  // Return internal rate of return

  return resultRate;

}



//Present Value

 /***********************************************

  *              Present Value                  *

  * pv = fv / (1 + (rate / freq))^periods       *

  * pv = Present Value                          *

  * fv = Future Value                           *

  * rate = interest rate (expressed as %)       *

  * freq = compounding frequency                *

  * periods = number of periods until maturity  *

  ***********************************************/

function presentValue(fv, freq, rate, periods)

{

    return (fv / Math.pow((1 + (rate / 100 / freq)), periods));

}



//Future Value

 /************************************************

  *                Future Value                  *

  * fv = pv * (1 + (rate / freq))^periods        *

  * fv = Future Value                            *

  * pv = Present Value                           *

  * rate = interest rate (expressed as %)        *

  * freq = compounding frequency                 *

  * periods = number of periods until maturity   *

  ************************************************/

function futureValue(pv, freq, rate, periods)

{

    return (pv * Math.pow(1 + (rate / 100 / freq), periods));

}



//Annualized Return

 /************************************************

  *            Annualized Return                 *

  * r = (fv - pv) / pv / years                   *

  * fv = future value                            *

  * pv = present value                           *

  * years = term of loan in years                *

  ************************************************/

function annualizedReturn(fv, pv, years)

{

    return (fv - pv) / pv / years;

}



function IRR(fv,pv,years){

	return (Math.pow((fv / pv),(1 / years)) - 1)*100;

}

function IRRMonthly(fv,pv,months){

	return (Math.pow((fv / pv),(1 / (months/12))) - 1)*100;

}



function howLong(fv,pv,rate){

	return Math.log(fv / pv) / Math.log(1 + (rate/100));

}



 /***********************************************

  *         Compound Interest Rate              *

  * r = n[(a/p)^1/nt -1                         *

  * a = total accrued principal and interest    *

  * p = principal                               *

  * n = compounding frequency                   *

  * t = total number of periods                 *

  ***********************************************/  

function CIR(a,p,n,t){

	return n*(Math.pow((a/p),(1/(n*t)))-1);

}



//Monthly Payment

function monthlyPayment(pv, freq, rate, periods)

{

    rate = rate / 100 / freq;

    

    var x = Math.pow(1 + rate, periods);

    return (pv * x * rate) / (x - 1);

}



//Annuity

 /***********************************************

  *                 Annuity                     *

  * a = fv / (((1 + r / c)^n) - 1) / (r/c)      *

  * fv = future value                           *

  * r = interest rate                           *

  * c = compounding frequency                   *

  * n = total number of periods                 *

  ***********************************************/  

function annuity(fv, freq, rate, periods)

{

    rate = rate / 100 / freq;

    return (fv / ((Math.pow(1 + rate, periods) - 1)) * rate);

}



//Mortgage Principal

function calcAmortPrincipal(pymt, freq, rate, periods)

{

    rate = rate / 100 / freq;

    return (pymt * (1 - (1 / Math.pow(1 + rate, periods))) / rate);

}



//Regular Deposit

function regularDeposit(payment, freq, rate, periods)

{

    rate = rate / 100 / freq;

    return (payment * (Math.pow(1 + rate, periods) - 1) / rate * (1 + rate));

}



//rounding

function round_decimals(original_number, decimals) {

  var result1 = original_number * Math.pow(10, decimals)

  var result2 = Math.round(result1)

  var result3 = result2 / Math.pow(10, decimals)

  return (result3)

}



//formats as currency

function formatCurrency(num) {

	if(!num){num = 0;}

	num = num.toString().replace(/\$|\,/g, '');

	if (isNaN(num)) num = "0";

	sign = (num == (num = Math.abs(num)));

	num = Math.floor(num * 100 + 0.50000000001);

	cents = num % 100;

	num = Math.floor(num / 100).toString();

	if (cents < 10) cents = "0" + cents;

	for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)

	num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));

	if(sign){

		return (((sign) ? '' : '-') + '$' + num + '.' + cents);

	}else{

		return '<span style="color:red;">' + (((sign) ? '' : '-') + '$' + num + '.' + cents) + '</span>';

	}

}



//formats as currency

function formatCurrencyNoDollar(num) {

	if(!num){num = 0;}

	num = num.toString().replace(/\$|\,/g, '');

	if (isNaN(num)) num = "0";

	sign = (num == (num = Math.abs(num)));

	num = Math.floor(num * 100 + 0.50000000001);

	cents = num % 100;

	num = Math.floor(num / 100).toString();

	if (cents < 10) cents = "0" + cents;

	for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)

	num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));

	return (((sign) ? '' : '-') + num + '.' + cents);

}



//formats as currency without - || $ || .00 for form fields

function inputCurrency(num){

	num = num.replace(/(,)/g, '');

	if(num.indexOf('.') !== -1){

		return num.replace(/(\d)(?=(\d{3})+(?!\d).)/g, "$1,");

	}else{

		return num.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

	}

}



function parseNumeric(num){

	num = num.toString();

	if(num.indexOf('-') == 0){

		return -Math.abs(Number(num.replace(/[^0-9\.]+/g,"")));

	}else{

		return Number(num.replace(/[^0-9\.]+/g,""));

	}

}



//formats as currency, without decimal places

function formatCurrencyNoDecimal(num) {

	if(!num){num = 0;}

	num = num.toString().replace(/\$|\,/g, '');

	if (isNaN(num)) num = "0";

	sign = (num == (num = Math.abs(num)));

	num = Math.floor(num * 100 + 0.50000000001);

	cents = num % 100;

	num = Math.floor(num / 100).toString();

	if (cents < 10) cents = "0" + cents;

	for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)

	num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));

	if(cents > 49){num = num+1;}

	return (((sign) ? '' : '-') + '$' + num);

}



//formats as accounting

function formatAccounting(num) {

	num = num.toString().replace(/\$|\,/g, '');

	if (isNaN(num)) num = "0";

	sign = (num == (num = Math.abs(num)));

	num = Math.floor(num * 100 + 0.50000000001);

	cents = num % 100;

	num = Math.floor(num / 100).toString();

	if (cents < 10) cents = "0" + cents;

	for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)

	num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));

	return (((sign) ? '' : '(') + num + '.' + cents + ((sign) ? '' : ')'));

}



function calcAPY(rate,periods){

	rate = rate / periods;

	var apy = Math.pow((1 + rate),periods)-1;

	return apy;

}



function calcAPR(rate,periods){

	var apr = Math.pow((rate + 1),(1 / periods)) - 1;

	apr = apr * periods;

	return apr;

}



function calcPeriodicRate(rate){

	//var monthly = Math.pow((1 + (rate/100)),(1/12)) - 1;

	var monthly = (rate/12);

	return monthly;

}



function simpleInterestData(gross, rate, years){

	var finalArray = {

		period:'Year',

		interestArray:new Array(),

		growthArray:new Array(),

		grossArray:new Array(),

		newYears:new Array(),

		grossTotal:0

	};

	finalArray.adjrate = rate;

	finalArray.period = 'Year';

	var periods = years;

	//start loop through the years

	i=1;

	while(i<=periods){

		finalArray.newYears.push(i);

		if(i==1){

			finalArray.interestArray.push((gross*(finalArray.adjrate/100)));

			finalArray.growthArray.push((gross*(finalArray.adjrate/100)));

			finalArray.grossArray.push(gross);

			finalArray.grossTotal = (gross*(finalArray.adjrate/100));

		}else{

			finalArray.interestArray.push((gross*(finalArray.adjrate/100)));

			finalArray.growthArray.push(finalArray.growthArray[i-2] + (gross*(finalArray.adjrate/100)));

			finalArray.grossArray.push(gross);

			finalArray.grossTotal += (gross*(finalArray.adjrate/100));

		}

		i++;

	}

	return finalArray;

}



// Future value data structures

function futureValueData(gross, rate, years, variant){

	//set up data array

	var finalArray = {

		adjrate:0,

		period:0,

		grossArray:new Array(),

		growthArray:new Array(),

		interestArray:new Array(),

		incomeGrowth:0,

		incomeSum:0,

		newYears:new Array(),

		grossTotal:0

	};

	//set up the rate

	if(variant == 2){

		finalArray.adjrate = calcPeriodicRate(rate);

		finalArray.period = 'Month';

		var periods = (years*12);

	}else{

		finalArray.adjrate = rate;

		finalArray.period = 'Year';

		var periods = years;

	}

	//start loop through the years

	i=1;

	while(i<=periods){

		finalArray.newYears.push(i);

		if(i==1){

			if(variant == 1){ //lump sum

				finalArray.grossArray.push(gross);

				finalArray.growthArray.push((gross*(finalArray.adjrate/100)));

				finalArray.interestArray.push((gross*(finalArray.adjrate/100)));

				finalArray.incomeSum = (gross*(finalArray.adjrate/100)) + gross;

			}else if(variant == 2 || variant == 3){ //monthly and annual

				finalArray.grossArray.push(gross);

				finalArray.growthArray.push((gross*(finalArray.adjrate/100)));

				finalArray.interestArray.push((gross*(finalArray.adjrate/100)));

				finalArray.incomeSum = (gross*(finalArray.adjrate/100)) + gross;

			}else{ //ledger

				finalArray.grossArray.push(gross[i-1]);

				finalArray.grossTotal = gross[i-1];

				finalArray.growthArray.push((gross[i-1]*(finalArray.adjrate/100)));

				finalArray.interestArray.push((gross[i-1]*(rate/100)));

				finalArray.incomeSum = (gross[i-1]*(finalArray.adjrate/100)) + gross[i-1];

			}

		}else{

			if(variant == 1){ //annual

				finalArray.grossArray.push(gross);

				finalArray.growthArray.push(finalArray.growthArray[i-2] + (finalArray.incomeSum*(finalArray.adjrate/100)));

				finalArray.interestArray.push(finalArray.incomeSum*(finalArray.adjrate/100));

				finalArray.incomeSum = (finalArray.incomeSum*(finalArray.adjrate/100)) + finalArray.incomeSum;

			}else if(variant == 3 || variant == 2){ //monthly and annual

				finalArray.grossArray.push((gross * i));

				finalArray.growthArray.push(finalArray.growthArray[i-2] + ((finalArray.incomeSum + gross)*(finalArray.adjrate/100)));

				finalArray.interestArray.push((finalArray.incomeSum + gross)*(finalArray.adjrate/100));

				finalArray.incomeSum = ((finalArray.incomeSum + gross)*(finalArray.adjrate/100)) + (finalArray.incomeSum + gross);

			}else{ //ledger

				finalArray.grossTotal += gross[i-1];

				finalArray.grossArray.push(finalArray.grossTotal);

				finalArray.growthArray.push(finalArray.growthArray[i-2] + ((finalArray.incomeSum + gross[i-1])*(finalArray.adjrate/100)));

				finalArray.interestArray.push((finalArray.incomeSum + gross[i-1])*(finalArray.adjrate/100));

				finalArray.incomeSum = ((finalArray.incomeSum + gross[i-1])*(finalArray.adjrate/100)) + (finalArray.incomeSum + gross[i-1]);

			}

		}

		i++;

	}

	return finalArray;

}





// ============================================================

// END FINANCIAL FUNCTIONS

// ============================================================





// show the calculator documentation

// -----------------

function showDoc(){

	//add slide up/down for documentation

	$('#calc-doc').toggle();

	$('#calc-page').toggle();

	$('#dashboard-menu').toggleClass('active');

}



function equalIncrementArray(n,p){

	// n = number of objects

	// p = position as a percentage

	if(typeof n === 'undefined'){

		//error, no data

		return false;

	}else{

		if(n <= 1){

			//error, needs at least two to work

			return false;

		}else{

			var m = 100/n; //the middle, 100 divided by the number of objects

			var r = ((m*2)*(p/100)); //the real position

			var i = ((m - r)/(n/2)) + (((m - r)/(n/2))/(n-1)); //the increment, the amount that gets added for each in the loop

			var tempArray = [];

			for(q=0;q<n;q++){

				if(q == 0){

					var t = parseNumeric(r.toFixed(6));

					tempArray.push(t);

				}else{

					var s = tempArray[q-1] + i;

					var t = Math.max(parseNumeric(s.toFixed(6)),0);

					tempArray.push(t);

				}

			}

			var total = tempArray.reduce(function(a, b){return a+b;});

			return tempArray;

		}

	}

}



function uniqueArray(data){

    return data.filter(function(el, index, arr) {

        return index === arr.indexOf(el);

    });

}



function dateSort(a,b){

	if(a.date && b.date){

		var dateA = new Date(a.date).getTime();

		var dateB = new Date(b.date).getTime();

	}else{

		var dateA = new Date(a).getTime();

		var dateB = new Date(b).getTime();

	}

    return dateA > dateB ? 1 : -1;

}



function ageBetweenDates(start, end){

	//set returning variables (increments)

	years = 0;

	months = 0;

	days = 0;

	//get variables passed in converted for comparison

	var mstart = $.datepicker.parseDate('yy-mm-dd', start); //convert date to date string

	var mend = $.datepicker.parseDate('yy-mm-dd', end);

	var ssec = mstart.setFullYear(mstart.getFullYear()); //milliseconds

	var esec = mend.setFullYear(mend.getFullYear());

	//while the start is less than the end, add the largest increment possible until they match, storing the increments

	while(ssec < esec){

		var stemp = new Date(ssec);

		var splus = stemp.setFullYear(stemp.getFullYear() + 1);

		if(splus < esec){

			years++;

			ssec = splus;

		}else{

			var stemp = new Date(ssec);

			var splus = (stemp.setMonth(stemp.getMonth()+1)) + 1;

			if(splus < esec){

				months++;

				ssec = splus;

			}else{

				var stemp = new Date(ssec);

				var splus = stemp.setDate(stemp.getDate() + 1);

				if(splus < esec){

					days++;

					ssec = splus;

				}else{

					break;

				}

			}

		}

	}

	//build the return array

	var age = {

		years:years,

		months:months,

		days:days

	};

	//return it

	return age;

}





//convert to a mm/dd/yyyy from a php date(Y-m-d) 

function dateConvertFromPhp(date){

	var splitdate = date.split("-");

	var newdate = splitdate[1] + "/" + splitdate[2] + "/" + splitdate[0];

	return newdate;

}



//convert to a php date(Y-m-d) from mm/dd/yyyy 

function dateConvertToPhp(date){

	var splitdate = date.split("/");

	var newdate = splitdate[2] + "-" + splitdate[0] + "-" + splitdate[1];

	return newdate;

}



//generate today's date

function generateCurrentDate(){

	var today = new Date();

	var dd = today.getDate();

	var mm = today.getMonth()+1;

	var yyyy = today.getFullYear();

	if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} today = mm+'/'+dd+'/'+yyyy;

	var thedate = yyyy+'-'+mm+'-'+dd;

	return thedate;

}



function charRestricted(evt) {

  var theEvent = evt || window.event;

  var rv = true;

  //var key = theEvent.keyCode || theEvent.which;

  var key = (typeof theEvent.which === 'undefined') ? theEvent.keyCode : theEvent.which;

  if (key && (key !== 8)){

    var keychar = String.fromCharCode(key);

    var keycheck = /[a-zA-Z0-9- .]/;

    if (!keycheck.test(keychar) )

    {

      rv = theEvent.returnValue = false;//for IE

      if (theEvent.preventDefault) theEvent.preventDefault();//Firefox

    }

  }

  return rv;

}



function charRestrictedSoft(evt) {

  var theEvent = evt || window.event;

  var rv = true;

  //var key = theEvent.keyCode || theEvent.which;

  var key = (typeof theEvent.which === 'undefined') ? theEvent.keyCode : theEvent.which;

  if (key && (key !== 8)){

    var keychar = String.fromCharCode(key);

    var keycheck = /[a-zA-Z0-9- .,'!]/;

    if (!keycheck.test(keychar) )

    {

      rv = theEvent.returnValue = false;//for IE

      if (theEvent.preventDefault) theEvent.preventDefault();//Firefox

    }

  }

  return rv;

}



function charRestrictedEmail(evt) {

  var theEvent = evt || window.event;

  var rv = true;

  //var key = theEvent.keyCode || theEvent.which;

  var key = (typeof theEvent.which === 'undefined') ? theEvent.keyCode : theEvent.which;

  if (key && (key !== 8)){

    var keychar = String.fromCharCode(key);

    var keycheck = /[a-zA-Z0-9- .@]/;

    if (!keycheck.test(keychar) )

    {

      rv = theEvent.returnValue = false;//for IE

      if (theEvent.preventDefault) theEvent.preventDefault();//Firefox

    }

  }

  return rv;

}



function charRestrictedEmailWithComma(evt) {

  var theEvent = evt || window.event;

  var rv = true;

  //var key = theEvent.keyCode || theEvent.which;

  var key = (typeof theEvent.which === 'undefined') ? theEvent.keyCode : theEvent.which;

  if (key && (key !== 8)){

    var keychar = String.fromCharCode(key);

    var keycheck = /[a-zA-Z0-9- .,@]/;

    if (!keycheck.test(keychar) )

    {

      rv = theEvent.returnValue = false;//for IE

      if (theEvent.preventDefault) theEvent.preventDefault();//Firefox

    }

  }

  return rv;

}



function numRestricted(evt) {

  var theEvent = evt || window.event;

  var rv = true;

  //var key = theEvent.keyCode || theEvent.which;

  var key = (typeof theEvent.which === 'undefined') ? theEvent.keyCode : theEvent.which;

  if (key && (key !== 8)){

    var keychar = String.fromCharCode(key);

    var keycheck = /[0-9-.]/;

    if (!keycheck.test(keychar) )

    {

      rv = theEvent.returnValue = false;//for IE

      if (theEvent.preventDefault) theEvent.preventDefault();//Firefox

    }

  }

  return rv;

}



function isNumberKey(evt)

{

  var charCode = (evt.which) ? evt.which : event.keyCode;

  if (charCode != 46 && charCode > 31 

	&& (charCode < 48 || charCode > 57))

	 return false;



  return true;

}



//parse month

function parseFullMonth(monthnumber){

	//use: parseMonth($(this).datepicker('getDate'))

	//use from the onClose or onSelect of the picker

	var month = new Array();

	month[0] = "January";

	month[1] = "February";

	month[2] = "March";

	month[3] = "April";

	month[4] = "May";

	month[5] = "June";

	month[6] = "July";

	month[7] = "August";

	month[8] = "September";

	month[9] = "October";

	month[10] = "November";

	month[11] = "December";

	return month[monthnumber];

}





//parse date

function parseDate(mode, date){

	if(mode == 1){

		var splitdate = date.split("-");

		var text = splitdate[0];

	}

	if(mode == 4){

		var splitdate = date.split("-");

		var yearNum = splitdate[0];

		var monthNum = splitdate[1];

		if(monthNum == 1){

			var text = "Q1 "+yearNum;

		}else if(monthNum == 4){

			var text = "Q2 "+yearNum;

		}else if(monthNum == 7){

			var text = "Q3 "+yearNum;

		}else if(monthNum == 10){

			var text = "Q4 "+yearNum;

		}

	}

	if(mode == 12){

		var splitdate = date.split("-");

		var yearNum = splitdate[0];

		var monthNum = splitdate[1];

		if(monthNum == 1){

			var text = "Jan "+yearNum;

		}else if(monthNum == 2){

			var text = "Feb "+yearNum;

		}else if(monthNum == 3){

			var text = "Mar "+yearNum;

		}else if(monthNum == 4){

			var text = "Apr "+yearNum;

		}else if(monthNum == 5){

			var text = "May "+yearNum;

		}else if(monthNum == 6){

			var text = "Jun "+yearNum;

		}else if(monthNum == 7){

			var text = "Jul "+yearNum;

		}else if(monthNum == 8){

			var text = "Aug "+yearNum;

		}else if(monthNum == 9){

			var text = "Sep "+yearNum;

		}else if(monthNum == 10){

			var text = "Oct "+yearNum;

		}else if(monthNum == 11){

			var text = "Nov "+yearNum;

		}else if(monthNum == 12){

			var text = "Dec "+yearNum;

		}

	}

	return text;

}





function abbrNum(number, decPlaces) {

    // 2 decimal places => 100, 3 => 1000, etc

    decPlaces = Math.pow(10,decPlaces);

    // Enumerate number abbreviations

    var abbrev = [ "k", "m", "b", "t" ];

    // Go through the array backwards, so we do the largest first

    for (var i=abbrev.length-1; i>=0; i--) {

        // Convert array index to "1000", "1000000", etc

        var size = Math.pow(10,(i+1)*3);

        // If the number is bigger or equal do the abbreviation

        if(size <= number) {

             // Here, we multiply by decPlaces, round, and then divide by decPlaces.

             // This gives us nice rounding to a particular decimal place.

             number = Math.round(number*decPlaces/size)/decPlaces;

             // Handle special case where we round up to the next abbreviation

             if((number == 1000) && (i < abbrev.length - 1)) {

                 number = 1;

                 i++;

             }

             // Add the letter for the abbreviation

             number += abbrev[i];

             // We are done... stop

             break;

        }else{

			number = (Math.round(number*100)/100);

		}

    }

    return number;

}



function combinations(str) {

    var fn = function(active, rest, a) {

        if (!active && !rest)

            return;

        if (!rest) {

            a.push(active);

        } else {

            fn(active + rest[0], rest.slice(1), a);

            fn(active, rest.slice(1), a);

        }

        return a;

    }

    return fn("", str, []);

}



//checks to see if an element exists

function checkElement(id){

	if ($("#"+id).length > 0)

		return true;

	else

		return false;

}



//rearrangeSpans

//this will hide sibling spans and increase one to full with

function rearrangeSpans(id, span){

	$('#'+id).siblings().fadeOut(500);

	$('#'+id).fadeOut(500);

	$('.spanheads').fadeOut(500);

	setTimeout(function(){

		$('#'+id).removeClass('span'+span);

		$('#'+id).fadeIn(500);

		$('#saveInfo').fadeIn(500);

	}, 500);

}



//reverseRearrangeSpans

function reverseRearrangeSpans(id, span){

	$('#'+id).fadeOut(500);

	$('#saveInfo').fadeOut(500);

	setTimeout(function(){

		$('#'+id).addClass('span'+span);

		$('#'+id).siblings().fadeIn(500);

		$('#'+id).fadeIn(500);

		$('.spanheads').fadeIn(500);

	}, 500);

}



//this limits a field to numeric only

function isNumberKey(evt)

{

  var charCode = (evt.which) ? evt.which : event.keyCode;

  if (charCode != 46 && charCode > 31 

	&& (charCode < 48 || charCode > 57))

	 return false;



  return true;

}



function animateSwap(hide,show){

	$('#'+hide).fadeOut(500);

	setTimeout(function(){

		$('#'+show).fadeIn(500);

	}, 500);

}



function showChart(id,row){

	if(typeof id === 'undefined'){

		$('#chart').show();

		$('#calc-detail').hide();

	}else{

		$('#chart'+id).show();

		$('#calc-detail'+id).hide();

	}

	$('.calc-ui-button').removeClass('btn-success');

	$('#calc-detail-button').removeClass('btn-success');

	$('#calc-chart-button').addClass('btn-success');

	if(typeof row != 'undefined'){

		$('#chartRow').show();

		$('#detailRow').hide();

		$('.calc-detail').hide();

	}

}



function showDetails(id,row){

	if(typeof id === 'undefined'){

		$('#chart').hide();

		$('#calc-detail').show();

	}else{

		$('#chart'+id).hide();

		$('#calc-detail'+id).show();

	}

	$('.calc-ui-button').removeClass('btn-success');

	$('#calc-chart-button').removeClass('btn-success');

	$('#calc-detail-button').addClass('btn-success');

	if(typeof row != 'undefined'){

		$('#chartRow').hide();

		$('#detailRow').show();

		$('.calc-detail').show();

	}

}



function reset(){

	$('#calc-toolbar').hide();

	showChart();

	$('.calc-input-field').val('');

	$('#answerSentence').html('');

	$('#answerDisplay').html('');

	$('#chart').html('');

	$('#view').hide();

}



function resetAB(){

	$('#calc-toolbarA').hide();

	$('#calc-toolbarB').hide();

	$('#calc-toolbar').hide();

	showChart('A',1);

	showChart('B',1);

	$('.calc-input-field').val('');

	$('#answerSentence').html('');

	$('#answerDisplay').html('');

	$('#chartA').html('');

	$('#chartB').html('');

}



function changeVariant(num){

	//get the current variables

	var rate = $('#rate'+variant).val();

	var years = $('#years'+variant).val();

	

	//set the ones we are showing to the variables

	$('#rate'+num).val(rate);

	$('#years'+num).val(years);

	

	//clear the chart

	$('#chart').html('');

	$('#detailBody').html('');

	

	//clear the first field

	$('.firstClass').val('');

	

	//hide/show the input

	$('.calc-input-body-var').hide();

	$('.body-variation'+num).show();

	

	//get active reset on links

	$('.variation').removeClass('active');

	$('#variation'+num).addClass('active');

	

	//update the global

	variant = parseInt(num);

	

	//hide the toolbar and answer, show the chart container

	$('#calc-toolbar').hide();

	showChart();

	$('#answerSentence').html('');

	$('#answerDisplay').html('');

}



function populateLedger(num){

	$('#ledgerTable').html('');

	var years = parseInt($('#years'+num).val());

	var i = 1;

	var mark = "'";

	while(i<=years){

		$('#ledgerTable').append('<tr><td style="text-align:center;">'+i+'</td><td style="text-align:center;"><a id="ledgerRow-'+i+'" href="javascript:void(0);" onclick="populateRowTemplate('+mark+i+mark+');">$0.00</a></td></tr>');

		i++;

	}

}



function populateRowTemplate(num){

	if(typeof yearstoapply === 'undefined'){

		var years = 1;

	}else{

		var years = yearstoapply;

	}

	if(typeof inflation === 'undefined'){

		var inf = 0;

	}else{

		var inf = inflation;

	}

	$('#body-bump-2').collapse('show');

	var mark = "'";

	var string = '<h3 class="calc-bump-title">Edit amounts from year '+num+'</h3><div class="form-group"><label for="bump-amount" class="control-label">Amount</label><div class="input-group"><div class="input-group-prepend"><span class="input-group-text calc-addon">$</span></div><input type="numeric" class="inputCurrency calc-input-field form-control input-xl" id="bump-amount"/></div></div><div class="form-group"><label for="bump-years" class="control-label">Years to Apply</label><input type="numeric" class="calc-input-field form-control input-xl" id="bump-years" value="'+years+'"/></div><div class="form-group"><label for="bump-inflation" class="control-label">Inflation</label><div class="input-group"><input type="numeric" class="calc-input-field form-control input-xl" id="bump-inflation" value="'+inf+'"/><div class="input-group-append"><span class="input-group-text calc-addon">%</span></div></div></div><div class="form-group"><label class="control checkbox"><input type="checkbox" id="bump-zero"><span class="checkbox-label"> Zero all future years</span></label></div><div class="form-group"><center><a href="javascript:void(0);" class="btn btn-success" onclick="populateAddedAmounts('+mark+num+mark+');">Enter</a></center></div>';

	$('#body-bump-2').html(string);

	

	$( ".inputCurrency" ).keyup(function() {

		$(this).val(inputCurrency($(this).val()));

	});

}



function populateAddedAmounts(num){

	var num = parseInt(num);

	//get values from form

	var amount = parseNumeric($('#bump-amount').val());

	yearstoapply = parseNumeric($('#bump-years').val());

	var totalyears = parseNumeric($('#years4').val());

	inflation = parseNumeric($('#bump-inflation').val());

	if($('#bump-zero').prop('checked')){

		var zero = true;

	}else{

		var zero = false;

	}

	

	var amountArray = [];

	//calculate the inflation

	//for each year, add inflation% more to amount

	//populate the table 'ledgerRow-num'

	var i=1;

	while(i<=totalyears){ //go through all the years to project

		if(i == num){ //if current year is equal to the one we are starting on

			amountArray.push(amount);

			$('#ledgerRow-'+i).html(formatCurrency(amount));

		}else if(i >= num && i <= (num + yearstoapply - 1)){ //it is greater than the one we started on and is <= to (one we started on + the number of years we want)

			var adjusted = amountArray[i-2] + (amountArray[i-2]*(inflation/100));

			amountArray.push(adjusted);

			$('#ledgerRow-'+i).html(formatCurrency(adjusted));

		}else if(i < num){ //else means it is less than where we are starting

			amountArray.push(0);

		}else{ //else means it is greater than how far we want to go

			amountArray.push(0);

			if(zero){

				$('#ledgerRow-'+i).html(formatCurrency(0));

			}

		}

		i++;

	}

	

	//destroy the editing template

	$('#body-bump-2').html('');

	$('#body-bump-2').collapse('hide');

}



function updatePresets(preset,calcid){

	if(preset){ //there's presets, so populate from those

		// -------------------------------------------

		if(calcid == 1){ //lost money

			$('#lostMoney').val(isNaN(preset.lostMoney)?0:preset.lostMoney);

			$('#rate').val(isNaN(preset.rate)?0:preset.rate);

			$('#years').val(isNaN(preset.years)?0:preset.years);

		}else if(calcid == 2){ //future value

			//remove active class from all children of variation-title

			$('.variation-title a').removeClass('active');

			//determine which s/b active and activate it

			$('.variation-title a:nth-child('+preset.variant+')').addClass('active');

			$('.variation-title a:nth-child('+preset.variant+')').click();

			$('#rate'+preset.variant).val(preset.rate);

			$('#years'+preset.variant).val(preset.years);

			if(preset.variant == 1){ //lump sum

				$('#sum'+preset.variant).val(formatCurrencyNoDollar(preset.sum));

			}else if(preset.variant == 2){ //monthly

				$('#sum'+preset.variant).val(formatCurrencyNoDollar(preset.sum));

				if(preset.interest){

					$('#rateType'+preset.variant+'-2').prop("checked",true);

				}else{

					$('#rateType'+preset.variant+'-1').prop("checked",true);

				}

			}else if(preset.variant == 3){ //annual

				$('#sum'+preset.variant).val(formatCurrencyNoDollar(preset.sum));

			}else if(preset.variant == 4){ //ledger

				if(typeof preset.ledger !== 'undefined'){

					var ledger = JSON.parse(preset.ledger);

					if(ledger && preset.ledger[0]){

						$.each(ledger,function(i,v){

							var mark = "'";

							$('#ledgerTable').append('<tr><td style="text-align:center;">'+(i+1)+'</td><td style="text-align:center;"><a id="ledgerRow-'+(i+1)+'" onclick="populateRowTemplate('+mark+(i+1)+mark+');" href="javascript:void(0);">'+formatCurrency(v)+'</a></td></tr>');

						});

					}

				}

			}

		}else if(calcid == 3){ //present value

			//remove active class from all children of variation-title

			$('.variation-title a').removeClass('active');

			//determine which s/b active and activate it

			$('.variation-title a:nth-child('+preset.variant+')').addClass('active');

			$('.variation-title a:nth-child('+preset.variant+')').click();

			$('#rate'+preset.variant).val(preset.rate);

			$('#years'+preset.variant).val(preset.years);

			$('#sum'+preset.variant).val(formatCurrencyNoDollar(preset.sum));

			if(preset.interest){

				$('#rateType'+preset.variant+'-2').prop("checked",true);

			}else{

				$('#rateType'+preset.variant+'-1').prop("checked",true);

			}

		}else if(calcid == 4){ //internal rate of return

			$('#pv').val(formatCurrencyNoDollar(preset.pv));

			$('#fv').val(formatCurrencyNoDollar(preset.fv));

			$('#years').val(preset.years);

		}else if(calcid == 5){ //how long?

			$('#pv').val(formatCurrencyNoDollar(preset.pv));

			$('#fv').val(formatCurrencyNoDollar(preset.fv));

			$('#rate').val(preset.rate);

		}else if(calcid == 6){ //person a vs person b

			$('#personA').val(preset.personA);

			$('#personB').val(preset.personB);

			$('#goal').val(formatCurrencyNoDollar(preset.goal));

			$('#ageGoal').val(preset.ageGoal);

			if(preset.ratePmt){

				$('#ratePmt2').prop("checked",true);

				$('#ratePmt2').click();

			}else{

				$('#ratePmt1').prop("checked",true);

				$('#ratePmt1').click();

			}

			$('#ratePmt').val(formatCurrencyNoDollar(preset.rate));

		}else if(calcid == 7){ //Simple vs. Compound

			$('#rateA').val(preset.rateA);

			$('#rateB').val(preset.rateB);

			$('#goal').val(formatCurrencyNoDollar(preset.goal));

		}else if(calcid == 8){ //What Costs More?

			$('#termp').val(formatCurrencyNoDollar(preset.termp));

			$('#termc').val(formatCurrencyNoDollar(preset.termc));

			$('#wholp').val(formatCurrencyNoDollar(preset.wholp));

			$('#wholc').val(formatCurrencyNoDollar(preset.wholc));

			$('#univp').val(formatCurrencyNoDollar(preset.univp));

			$('#univc').val(formatCurrencyNoDollar(preset.univc));

			$('#year').val(preset.year);

		}else if(calcid == 9){ //The Ideal Parking Place

			//no presets

		}else if(calcid == 10){ //What are you insuring?

			$('#bicov').val(formatCurrencyNoDollar(preset.bicov));

			$('#bicos').val(formatCurrencyNoDollar(preset.bicos));

			$('#cccov').val(formatCurrencyNoDollar(preset.cccov));

			$('#cccos').val(formatCurrencyNoDollar(preset.cccos));

			$('#prem').val(formatCurrencyNoDollar(preset.prem));

		}else if(calcid == 11){ //Opportunity cost of one claim

			$('#age').val(preset.age);

			$('#claim').val(formatCurrencyNoDollar(preset.claim));

			$('#covr').val(formatCurrencyNoDollar(preset.covr));

			$('#ocost').val(preset.ocost);

			$('#lifeex').val(preset.lifeex);

		}else if(calcid == 12){ //Spending The Death Benefit

			//no presets

		}else if(calcid == 13){ //Cost of Financing

			$('#carVal').val(formatCurrencyNoDollar(preset.carVal));

			$('#oldTerm').val(preset.oldTerm);

			$('#oldIntRate').val(preset.oldIntRate);

			$('#newTerm').val(preset.newTerm);

			$('#newIntRate').val(preset.newIntRate);

		}else if(calcid == 14){ //Late Pay vs IRA

			$('#savingsrate').val(formatCurrencyNoDollar(preset.savingsrate));

			$('#savings').val(formatCurrencyNoDollar(preset.savings));

			$('#latefee').val(formatCurrencyNoDollar(preset.latefee));

			$('#occurences').val(preset.occurences);

		}else if(calcid == 15){ //Debt vs Savings

			$('#monthlyAvailable').val(formatCurrencyNoDollar(preset.monthlyAvailable));

			$('#youOwe').val(formatCurrencyNoDollar(preset.youOwe));

			$('#debtRate').val(preset.debtRate);

			$('#savingsRate').val(preset.savingsRate);

			$('#fedStateRate').val(preset.fedStateRate);

		}else if(calcid == 16){ //Loan Amortization Schedule

			$('#loanAmt').val(formatCurrencyNoDollar(preset.loanAmt));

			$('#apr').val(preset.apr);

			$('#term').val(preset.term);

			if(preset.termType){

				$('#termType').prop("checked",true);

			}else{

				$('#termType').prop("checked",true);

			}

			$('#xtraAmt').val(formatCurrencyNoDollar(preset.xtraAmt));

		}else if(calcid == 17){ //Payment Plan vs Credit Card

			$('#setFee').val(formatCurrencyNoDollar(preset.setFee));

			$('#monthFee').val(formatCurrencyNoDollar(preset.monthFee));

			$('#cardRate').val(preset.cardRate);

			$('#upFront').val(preset.upFront);

			$('#premium').val(formatCurrencyNoDollar(preset.premium));

			$('#premTerm').val(preset.premTerm);

			$('#noInt').val(preset.noInt);

			$('#reward').val(preset.reward);

		}else if(calcid == 18){ //You'll Earn a Fortune

			$('#startingAge').val(preset.startingAge);

			$('#currentAge').val(preset.currentAge);

			$('#yearsToProject').val(preset.yearsToProject);

			$('#income').val(preset.income);

			$('#growthRate').val(preset.growthRate);

			$('#investmentRate').val(preset.investmentRate);

			$('#taxStatus').val(preset.taxStatus);

			$('#exHouse').val(preset.exHouse);

			$('#exCars').val(preset.exCars);

			$('#exExpenses').val(preset.exExpenses);

			$('#exInsurance').val(preset.exInsurance);

			$('#exDebt').val(preset.exDebt);

			$('#exLifestyle').val(preset.exLifestyle);

		}else if(calcid == 19){ //Retirement Reality Check

			$('#now_age').val(preset.now_age);

			$('#retire_age').val(preset.retire_age);

			$('#expectancy').val(preset.expectancy);

			$('#cur_savings').val(formatCurrencyNoDollar(preset.cur_savings));

			$('#principal').val(formatCurrencyNoDollar(preset.principal));

			$('#preinterest').val(preset.preinterest);

			$('#interest').val(preset.interest);

			$('#inflate').val(preset.inflate);

		}else if(calcid == 20){ //uninterrupted compounding

			$('#investment').val(formatCurrencyNoDollar(preset.investment));

			$('#interestrate').val(preset.interestrate);

			$('#yearsProject').val(preset.yearsProject);

			$('#interruption').val(formatCurrencyNoDollar(preset.interruption));

			$('#atyear').val(preset.atyear);

		}else if(calcid == 23){ //Renting vs Owning

			$('#rent').val(formatCurrencyNoDollar(preset.rent));

			$('#price').val(formatCurrencyNoDollar(preset.price));

			$('#down').val(preset.down);

			$('#rate').val(preset.rate);

			$('#term').val(preset.term);

			$('#years').val(preset.years);

			$('#tax').val(preset.tax);

			$('#app').val(preset.app);

			$('#ocost').val(preset.cost);

			$('#inflate').val(preset.infl);

		}else if(calcid == 24){ //Retirement Planner

			$('#now_age').val(preset.now_age);

			$('#retire_age').val(preset.retire_age);

			$('#expectancy').val(preset.expectancy);

			$('#cur_savings').val(formatCurrencyNoDollar(preset.cur_savings));

			$('#principal').val(formatCurrencyNoDollar(preset.principal));

			$('#contribution').val(formatCurrencyNoDollar(preset.contribution));

			$('#preinterest').val(preset.preinterest);

			$('#interest').val(preset.interest);

			$('#inflate').val(preset.inflate);

			if(preset.inflateC){

				$('#inflateCy').prop("checked",true);

				$('#inflateCy').click();

			}else{

				$('#inflateCn').prop("checked",true);

				$('#inflateCn').click();

			}

		}else if(calcid == 25){ //cost of shopping auto insurance

			$('#currAnnPrem').val(formatCurrencyNoDollar(preset.currAnnPrem));

			$('#potAnnPrem').val(formatCurrencyNoDollar(preset.potAnnPrem));

			$('#timeSpent').val(preset.timeSpent);

			$('#hourlyWage').val(formatCurrencyNoDollar(preset.hourlyWage));

			$('#currAge').val(preset.currAge);

			$('#retAge').val(preset.retAge);

			$('#interestRate').val(preset.interestRate);

		}else if(calcid == 26){ //the latte effect

			$('#moAdd').val(formatCurrencyNoDollar(preset.moAdd));

			$('#period').val(preset.period);

			$('#interest').val(preset.interest);

			$('#compInt').val(preset.compInt);

			$('#payments').val(preset.payments);

		}else if(calcid == 27){ //the millionaire calculator

			$('#pmt').val(formatCurrencyNoDollar(preset.pmt));

			$('#freq').val(preset.freq);

			$('#fv').val(formatCurrencyNoDollar(preset.fv));

			$('#rate').val(preset.rate);

			$('#cfreq').val(preset.cfreq);

			if(preset.termType){

				$('#termType1').prop("checked",true);

				$('#termType1').click();

			}else{

				$('#termType0').prop("checked",true);

				$('#termType0').click();

			}

		}else if(calcid == 28){ //compounding comparison

			$('#principal').val(formatCurrencyNoDollar(preset.principal));

			$('#moAdd').val(formatCurrencyNoDollar(preset.moAdd));

			$('#period').val(preset.period);

			$('#interest').val(preset.interest);

			$('#compInt').val(preset.compInt);

			$('#payments').val(preset.payments);

		}else if(calcid == 29){ //average vs actual

			$('#investment').val(formatCurrencyNoDollar(preset.investment));

			$('#year1').val(preset.year1);

			$('#year2').val(preset.year2);

			$('#year3').val(preset.year3);

		}else if(calcid == 30){ //compound vs speculation

			$('#initialInvestment').val(formatCurrencyNoDollar(preset.initialInvestment));

			$('#compoundRate').val(preset.compoundRate);

			$('#comparison').val(preset.comparison);

			$('#yearStart').val(preset.yearStart);

			$('#yearEnd').val(preset.yearEnd);

		}else if(calcid == 31){ //tax liability estimator

			$('#taxStatus').val(preset.taxStatus);

			$('#taxedIncome').val(preset.taxedIncome);

		}else if(calcid == 32){ //cost of credit cards

			$('#ccbal').val(preset.ccbal);

			$('#ccrate').val(preset.ccrate);

			$('#iror').val(preset.iror);

		}else if(calcid == 33){ //taxation history

			//no presets

		}else if(calcid == 34){ //deferral vs distribution

			$('#contribution').val(preset.contribution);

			$('#age1').val(preset.age1);

			$('#age2').val(preset.age2);

			$('#age3').val(preset.age3);

			$('#bracket1').val(preset.bracket1);

			$('#bracket2').val(preset.bracket2);

			$('#bracket3').val(preset.bracket3);

			$('#bracket4').val(preset.bracket4);

		}else if(calcid == 35){ //buying cars

			$('#financed').val(preset.financed);

			$('#rate').val(preset.rate);

			$('#payments').val(preset.payments);

			$('#yleft').val(preset.yleft);

			$('#tradeup').val(preset.tradeup);

			$('#frate').val(preset.frate);

		}else if(calcid == 36){ //equivalent risk

			$('#lostMoney').val(formatCurrencyNoDollar(preset.lostMoney));

			$('#cr').val(preset.cr);

			$('#pr').val(preset.pr);

			$('#years').val(preset.years);

		}else if(calcid == 37){ //compare two mortgages

			$('#loanAmt').val(formatCurrencyNoDollar(preset.loanAmt));

			$('#apr1').val(preset.apr1);

			$('#term1').val(preset.term1);

			$('#apr2').val(preset.apr2);

			$('#term2').val(preset.term2);

			$('#sideRate').val(preset.sideRate);

		}else if(calcid == 38){ //comparing investments

			$('#sum1').val(formatCurrencyNoDollar(preset.sum1));

			$('#years1').val(preset.years1);

			$('#rate1').val(preset.rate1);

			$('#rate2').val(preset.rate2);

			$('#rate3').val(preset.rate3);

			$('#tax1').val(preset.tax1);

			$('#tax2').val(preset.tax2);

		}else if(calcid == 39){ //spike your rate

			$('#investment').val(formatCurrencyNoDollar(preset.investment));

			$('#rate').val(preset.rate);

			$('#years').val(preset.years);

			$('#annrate').val(preset.annrate);
			
			$('#misyear').val(preset.misyear);
			
			$('#misyearnum').val(preset.misyearnum);
			
		}

	}

}



function toggleFullScreen(){

  if (!document.fullscreenElement &&    // alternative standard method

      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods

    if (document.documentElement.requestFullscreen) {

      document.documentElement.requestFullscreen();

    } else if (document.documentElement.msRequestFullscreen) {

      document.documentElement.msRequestFullscreen();

    } else if (document.documentElement.mozRequestFullScreen) {

      document.documentElement.mozRequestFullScreen();

    } else if (document.documentElement.webkitRequestFullscreen) {

      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);

    }

  } else {

    if (document.exitFullscreen) {

      document.exitFullscreen();

    } else if (document.msExitFullscreen) {

      document.msExitFullscreen();

    } else if (document.mozCancelFullScreen) {

      document.mozCancelFullScreen();

    } else if (document.webkitExitFullscreen) {

      document.webkitExitFullscreen();

    }

  }

}



function reindex_array_keys(array, start){

    var temp = [];

    start = typeof start == 'undefined' ? 0 : start;

    start = typeof start != 'number' ? 0 : start;

    for(i in array){

        temp[start++] = array[i];

    }

    return temp;

}



function zeroPad(num, places) {

  var zero = places - num.toString().length + 1;

  return Array(+(zero > 0 && zero)).join("0") + num;

}



function convertToYearString(number,type){

	var years = Math.floor(Math.max((number/type),0));

//	var remainder = Math.max((number-years),0);

//	return years+' Years, '+remainder+' '+string;

	var remainder = ((number - (years * type)) / type) * 12;

	if(years == 1){var text = 'Year';}else{var text = 'Years';}

	if(remainder == 1){var textm = 'Month';}else{var textm = 'Months';}

	return years+' '+text+', '+remainder+' '+textm;

}



$(document).ready(function(){

	Highcharts.setOptions({
		colors: ['#27a243', '#444444', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
	});

	$( ".inputCurrency" ).keyup(function() {

		$(this).val(inputCurrency($(this).val()));

	});

	

	//if there's a full screen button, listen for a click

	var element =  document.getElementById('toggleFullScreen1');

	if (typeof(element) != 'undefined' && element != null){

		document.getElementById("toggleFullScreen1").addEventListener("click", function(){

			toggleFullScreen();

		});

	}

});

