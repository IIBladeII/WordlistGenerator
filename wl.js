document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('wordlistForm');
    const wordlistOutput = document.getElementById('wordlistOutput');
    const downloadBtn = document.getElementById('downloadBtn');
    const numbersInput = document.getElementById('numbers');
    const specialCharsInput = document.getElementById('specialChars');
    const charactersInput = document.getElementById('characters');

    // Validação para caracteres (apenas letras)
    charactersInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '');
    });

    // Validação para números (existente)
    numbersInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Validação para caracteres especiais
    specialCharsInput.addEventListener('input', (e) => {
        // Remove qualquer caractere que não seja especial
        e.target.value = e.target.value.replace(/[a-zA-Z0-9]/g, '');
    });

    document.getElementById('commonPatterns').addEventListener('change', (e) => {
        document.getElementById('patternType').disabled = !e.target.checked;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const characters = document.getElementById('characters').value;
        const wordLength = parseInt(document.getElementById('wordLength').value);
        const numbers = document.getElementById('numbers').value;
        const specialChars = document.getElementById('specialChars').value;

        if (!validateInputs(characters, wordLength)) {
            alert('Please fill in at least the characters and word length fields.');
            return;
        }

        // Combine all allowed characters
        let allCharacters = characters;
        if (numbers) allCharacters += numbers;
        if (specialChars) allCharacters += specialChars;

        // Start wordlist generation
        wordlistOutput.value = 'Generating wordlist...';
        downloadBtn.disabled = true;

        // Generate wordlist asynchronously to prevent UI freezing
        setTimeout(() => {
            const wordlist = generateWordlist(allCharacters, wordLength);
            const finalWordlist = applyPatterns(wordlist);
            displayResults(finalWordlist);
        }, 100);
    });

    function validateInputs(chars, length) {
        const specialCharsValue = document.getElementById('specialChars').value;
        const charactersValue = document.getElementById('characters').value;
        
        // Verifica se há caracteres não alfabéticos no campo de caracteres
        if (!/^[a-zA-Z]*$/.test(charactersValue)) {
            alert('O campo de caracteres deve conter apenas letras');
            return false;
        }
        
        // Verifica caracteres especiais (mantendo validação existente)
        if (specialCharsValue && /[a-zA-Z0-9]/.test(specialCharsValue)) {
            alert('O campo de caracteres especiais deve conter apenas caracteres especiais');
            return false;
        }

        return chars.length > 0 && length > 0 && length <= 20;
    }

    function generateWordlist(chars, length) {
        const wordlist = [];
        const maxCombinations = Math.min(Math.pow(chars.length, length), 1000000);
        let generated = 0;
        const progressBar = document.getElementById('progressBar');
        
        function updateProgress() {
            const percentage = (generated / maxCombinations) * 100;
            progressBar.value = percentage;
            progressBar.textContent = `${percentage.toFixed(1)}%`;
        }

        function generate(prefix, remainingLength) {
            if (wordlist.length >= maxCombinations) return;
            
            if (remainingLength === 0) {
                wordlist.push(prefix);
                generated++;
                if (generated % 1000 === 0) updateProgress();
                return;
            }

            for (let i = 0; i < chars.length; i++) {
                generate(prefix + chars[i], remainingLength - 1);
            }
        }

        generate('', length);
        return wordlist;
    }

    function applyPatterns(wordlist) {
        const patterns = [];
        const leetMap = {
            'a': '4', 'e': '3', 'i': '1', 'o': '0', 
            's': '5', 't': '7', 'b': '8', 'g': '9'
        };

        if (document.getElementById('commonPatterns').checked) {
            const patternType = document.getElementById('patternType').value;
            
            wordlist.forEach(word => {
                switch(patternType) {
                    case 'leet':
                        let leetWord = word.split('').map(c => leetMap[c] || c).join('');
                        patterns.push(leetWord);
                        break;
                        
                    case 'capitalize':
                        patterns.push(word.charAt(0).toUpperCase() + word.slice(1));
                        break;
                        
                    case 'suffix':
                        for(let i = 0; i < 100; i++) {
                            patterns.push(word + i.toString().padStart(2, '0'));
                        }
                        break;
                        
                    case 'prefix':
                        for(let i = 0; i < 100; i++) {
                            patterns.push(i.toString().padStart(2, '0') + word);
                        }
                        break;
                }
            });
        }

        return [...new Set([...wordlist, ...patterns])];
    }

    function displayResults(wordlist) {
        wordlistOutput.value = wordlist.join('\n');
        downloadBtn.disabled = false;

        // Add download functionality
        downloadBtn.onclick = () => {
            const blob = new Blob([wordlist.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'wordlist.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    }
});