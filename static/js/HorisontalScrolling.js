var scrollInterval;

function MousOverLeft(e)
{
	scrollInterval = setInterval('Scroll(-20);', 60);
}

function MousOverRight(e)
{
	scrollInterval = setInterval('Scroll(20);', 60);
}

function Scroll(value)
{
	window.scrollBy(value,0);
}

function ScrollBoxMouseOut()
{
	clearInterval(scrollInterval);
}