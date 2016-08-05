# Format your code (html, js or css) from command line

This project contains 2 tools:
	1. code-formatter (format your HTML, CSS and JS)
	2. code-differ (run your code through code-formatter and then compare your code). This is really useful if you want to check the difference between 2 files after all the formatting is done. Extremely useful for code base that have different formatting commits.






## To Install
```
	npm install

	#to hook up the code-formatter
	sudo ln -s ./index.js /usr/local/bin/code-formatter

	#to hook up the differ
	sudo ln -s ./code-differ.js /usr/local/bin/code-differ
```

##link your diff
```
	#diffmerge on mac
	ln -s /Applications/DiffMerge.app/Contents/Resources/diffmerge.sh /usr/local/bin/diffmerge
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
		code-differ -f '/file1' '/file2'



		#option 2: diff commit hash with previous for changes
			code-differ -s '/file1' '825aa7a'


		#tools to use for differ: append the following to your command
		#opendiff (built in with MacOS)
		... 'opendiff $file1 $file2'

		#kdiff3
		... 'kdiff3 $file1 $file2'

		#or your custom differ, please note that this tool will not work with vimdiff
```
