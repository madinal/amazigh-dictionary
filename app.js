const myMap = new Map();
let definitions = [];


fetch('dictionary.json')
  .then(response => response.text())
  .then(text => {
	definitions = JSON.parse(text);
  })
  .catch(error => console.error('Error fetching dictionary:', error));

config = {
	selector: "#searchInput",
    placeHolder: "Search in all languages...",
	diacritics: true,
	resultsList: {
		element: (list, data) => {
		  const info = document.createElement("p");
		  if (data.results.length) {
			info.innerHTML = ` Displaying <strong>${data.results.length}</strong> out of <strong>${data.matches.length}</strong> results`;
		  } else {
			info.innerHTML = ` Found <strong>${data.matches.length}</strong> matching results for <strong>"${data.query}"</strong>`;
		  }
		  list.prepend(info);
		},
		noResults: true,
		maxResults: 20,
		tabSelect: true,
	},
    data: {
        src: async () => {
			  try {
			
				document.getElementById("searchInput").setAttribute("placeholder", "Loading...");
				// Fetch External Data Source
				const source = await fetch("./entries.json");
				const data = await source.json();
				// Post Loading placeholder text
				document.getElementById("searchInput").setAttribute("placeholder", autoCompleteJS.placeHolder);
				// Returns Fetched data
				return data;
			  } catch (error) {
				return error;
			  }
		},
		keys: ["entry"],
		cache: true
    },

    resultItem: {
		 element: (item, data) => {
		  // Modify Results Item Style
		  item.style = "display: flex; justify-content: space-between;";
		  // Modify Results Item Content
		  item.innerHTML = `
		  <span style="white-space: normal; overflow: hidden;">
			${data.match}
		  </span>`  ;
		},
        highlight: true,
    },
	events: {
    input: {
      selection(event) {
		  
			const feedback = event.detail;
			//console.log(feedback);
			autoCompleteJS.input.blur();			
			
			const selection = feedback.selection.value.entry;
			const dicLineId = feedback.selection.value.idx;
			autoCompleteJS.input.value = selection.split(" ")[0];
			inputElement.style.direction = 'ltr';
			
			//const dicLineId = myMap.get(selection);
			fetchDefinition(dicLineId);	
		  },
	   },
	}
}

const autoCompleteJS = new autoComplete(config);


// Load index data from file and build the binary tree
fetch('index.json')
    .then(response => response.text())
    .then(data => {
		
		const lines = JSON.parse(data);
        lines.forEach(line => {
            const [word, lineNumbers] = line;
			myMap.set(word, lineNumbers);
        });
		
    });


// Define search function
function searchWord() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();	
	const result = myMap.get(searchInput);
	
    if (typeof result !== 'undefined') {
        fetchDefinition(result);
    } else {
        document.getElementById('definition').innerText = 'Word not found.';
    }
}


function fetchDefinition(lineNumbers) {
	
	const definitionDiv = document.getElementById('definition');
	let joinedHtml = '';
	for (const wordId of lineNumbers) {
		wordDiv = wordToHtml(definitions[wordId]);
		joinedHtml += wordDiv.outerHTML;
	}
	definitionDiv.innerHTML = joinedHtml;
}

const inputElement = document.getElementById('searchInput');
inputElement.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
		this.blur();
        event.preventDefault();
		searchWord();
    }
	
});

inputElement.addEventListener('input', function(event) {
    const text = event.target.value;
    const isArabic = /[\u0600-\u06FF]/.test(text);
    inputElement.style.direction = isArabic ? 'rtl' : 'ltr';
});



function wordToHtml(data) {
	
	const div = document.createElement('div');
	const h5 = document.createElement('h4');
	const b = document.createElement('b');
	const i = document.createElement('i');
	const ul1 = document.createElement('ul');
	const ul2 = document.createElement('ul');

	const word = data[0]
	const senses = data[1]
	
	const tifi = word[0]
	const latin = word[1]
	const pos = word[2]
	b.textContent = tifi + ' ';
	i.textContent = `[${latin}]`;
	h5.appendChild(b);
	h5.appendChild(i);
	h5.innerHTML += ` ${pos}`;

	ul1.setAttribute('type', 'square');
	ul2.setAttribute('type', 'square');
	
	if (word[3] != null){
		const li1 = document.createElement('li');
		li1.innerHTML = `Etat d'annexion : <b>${word[3]}</b>`;
		ul1.appendChild(li1);
	}
	if (word[4] != null){
		const li2 = document.createElement('li');
		li2.innerHTML = `Pluriel état libre : <b>${word[4]}</b>`;
		ul1.appendChild(li2);
	}
	
	
	senses.forEach((item, index) => {
	
	  const li = document.createElement('li');
	  const span = document.createElement('span');
	  const br = document.createElement('br');

	  span.style.color = '#428BCA';
	  span.textContent = `Sens ${index + 1}   `;
	  li.appendChild(span);
	  li.appendChild(br);
	  
	  const frenchWord = item[0]
	  const arabicWord = item[1]
	  const englishWord = item[2]
	  
	  const spanRTL = document.createElement('span');
	  spanRTL.textContent = arabicWord;
	  spanRTL.setAttribute('dir', 'rtl');
	  li.appendChild(spanRTL);
	  
	  const br2 = document.createElement('br');
	  li.appendChild(br2);
	  
	  const spanFR = document.createElement('span');
	  spanFR.textContent = frenchWord;
	  li.appendChild(spanFR);
	  
	  li.appendChild(document.createElement('br'));
	  
	  const spanEN = document.createElement('span');
	  spanEN.textContent = englishWord;
	  li.appendChild(spanEN);
	  
	  ul2.appendChild(li);
	});

	div.appendChild(h5);
	div.appendChild(ul1);
	div.appendChild(ul2);
	return div;
}

