# Format your code (html, js or css) from command line

This project contains 2 tools:
	1. code-formatter (format your HTML, CSS and JS)
	2. code-differ (run your code through code-formatter and then compare your code). This is really useful if you want to check the difference between 2 files after all the formatting is done. Extremely useful for code base that have different formatting commits.






## To Install
```
	npm install

	#to hook up the code-formatter
	sudo ln -s /Users/sle/git/cli-code-formatter/index.js /usr/local/bin/code-formatter

	#to hook up the differ
	sudo ln -s /Users/sle/git/cli-code-formatter/code-differ.js /usr/local/bin/code-differ
```




## To Use
```
	#to format your code
		#for file
		code-formatter package.json

		#or plain string
		code-formatter '<string here>'

		#or pipe
		cat /tmp/test | code-formatter




	#Then to Compare Files
		#option 1: diff 2 files
		code-differ '/file1' '/file2'
	


		#option 2: diff commit hash with previous for changes
			#short sha1 form (7 chars)
			code-differ 825aa7a 'path to file'

			#long sha1 form (40 chars)
			code-differ 825aa7a17246433adf54063872a4604d27548319 'path to file'



		#tools to use for differ
		#opendiff (built in with MacOS)
		code-differ '/file1' '/file2' 'opendiff $file1 $file2'

		#kdiff3 
		code-differ '/file1' '/file2' 'kdiff3 $file1 $file2'

		#or your custom differ, please note that this tool will not work with vimdiff
```
