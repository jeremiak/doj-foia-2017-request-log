# doj foia request records

[😎 demo url](https://jeremiak.github.io/doj-foia-2017-request-log/)

data comes from this [foia request on muckrock.com](https://www.muckrock.com/foi/united-states-of-america-10/foia-log-2017-department-of-justice-office-of-legislative-affairs-47116/). i used [tabula](tabula.technology) and google sheets to create a csv (`cleaned.csv`) of the foia requests.

## install and development

1. `$ npm install`
1. `$ npm build`
1. project is [http://127.0.0.1:8642/](http://127.0.0.1:8642/)

## to do/explore

- what was the longest request? what were the longest 5?
- what was the quickest request? what were the quickest 5?
- which office got the most requests? which office had the highest denial rate?
- what about a three dimensional chart (circle size = days in duration, color = office, something else?)
- use the form interface as a detail explorer
