var scrollInterval;

function MousOverLeft(e)
{
    clearInterval(scrollInterval);
	scrollInterval = setInterval('Scroll(-20);', 60);
}

function MousOverRight(e)
{
    clearInterval(scrollInterval);
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