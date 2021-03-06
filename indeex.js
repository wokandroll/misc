let cheerio = require('cheerio')
let fs = require('fs');
var parse  = require('url-parse');


let postman= {
    info : {
        name: "Orion-Test",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item:[]
};


fs.readFile('./eclipse.html', function (err, html) {
    let $ = cheerio.load(html)
    // console.log($.html())
    let postmanItems = [];
    
    // console.log($.text())
    $(' div.container-fluid div.row div#content div#sections > section').each(function(seectionIndex, element){
        let header = $(element).attr('id');
        let headerTittle =$(element).find(`section#${header} >h1`);

        // sectionsList[seectionIndex]['id'] = header;

        let section = {
			name: `${headerTittle.text()}`,
			item: []
		}

        $(element).find('section>div').each(function(index, element){
            let requestName = $(element).attr('id');
            let article = $(element).find(`div#${requestName}>article`);
            let articleName = article.find('div>h1');
            let articleDescription =article.find(' article>p:nth-of-type(2)');
            let httpMethod =article.find('span.type');
            let url = article.find(`pre.prettyprint.language-html.prettyprinted code span.pln`);
            // console.log(parse(url.text()).query)
            let queryParams = [];
            if (parse(url.text()).query !== ''){
                let params = new URLSearchParams(parse(url.text()).query);
                let entries = params.entries();
                for(let entry of entries) { // each 'entry' is a [key, value] tupple
                const [key, value] = entry;
                queryParams.push({key, value})
                }
                console.log(entries)
                console.log(queryParams)
                 
            }

            let articleObj = {
                name: `${articleName.text()}`,
                request: {
                    method: `${httpMethod.text()}`,
                    header: [
                        {
                            "key": "Authorization",
                            "value": "Basic {{location}}",
                            "type": "text"
                        }
                    ],
                    body: {
                        mode: "raw",
                        raw: ""
                    },
                    url: {
                        raw: `${url.text()}`,
                        protocol: "https",
                        host: [
                            `${parse(url.text()).host}`
                        ],
                        path: parse(url.text()).pathname.split('/'),
                        query: queryParams
                           
                    },
                    description:`${articleDescription.text()}`
                }
            };

            section.item.push(articleObj);
            
            // sectionsList[seectionIndex][index]['request']['name'] = requestName;
        });
        postmanItems.push(section); 
        // console.log(items[0][0])
    });
    
    // console.log(items)
    postman.item = postmanItems;
    // console.log(JSON.stringify(postman.items)); 

    fs.writeFile('myjsonfile.json', JSON.stringify(postman), 'utf8', function(err) {
        if (err) throw err;
        console.log('complete');
        }
    );
})
