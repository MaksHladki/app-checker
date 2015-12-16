# app-checker
deep link mobile (ios, android)

#how to use
```
 var settings = {
            IOS: {
                appName: 'facebook',
                appId: '284882215',
                uri: 'fb://feed'
            },
            Android: {
                appName: 'com.facebook.katana',
                appId: 'com.facebook.katana',
                uri: 'fb://feed',
                info: {
                    name: 'Facebook',
                    description: '"Keeping up with friends is faster than ever.\n• See what friends are up to\n• Share updates, photos and videos\n• Get notified when friends like and comment on your posts\n• Text, chat and have group conversations\n• Play games and use your favorite apps\n\nRead our Data Use Policy, Terms and other important info in the legal section of our App Store description.\n\nContinued use of GPS running in the background can dramatically decrease battery life. Facebook doesn’t run GPS in the background unless you give us permission by turning on optional features that require this."',
                    img: 'http://is2.mzstatic.com/image/thumb/Purple69/v4/bf/66/bd/bf66bd16-2b84-2b2e-b434-19d6402ddd18/source/60x60bb.jpg',
                    rating: 4,
                    price: 'Free',
                    company: 'Facebook, Inc.'
                }
            }
        };


        window.onload = function () {
            new AppChecker(settings);
        }
        ```
