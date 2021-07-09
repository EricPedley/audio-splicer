# Audio Splicer
![project screenshot](https://user-images.githubusercontent.com/48658337/125023284-60fbca00-e033-11eb-8e89-f65a8b50d77a.jpg)
<br>[Demo Link](https://ericpedley.github.io/audio-splicer/)
## Description
  This is a web app that lets you upload a video, then cut and rearrange it. Using an Express backend, it calls IBM's speech to text API to generate a transcript with timestamps and then provides a drag and drop menu (using React) to rearrange the section for each word, then uses ffmpeg to edit the video and then provides a download link for the resulting file.

  This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

  Also uses the https://github.com/atlassian/react-beautiful-dnd React component library
