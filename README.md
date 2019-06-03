# Adventure Communist Free Capsule Tracker

This is a simple tool to assist players of the mobile game Adventure Communist.  The tool allows you to track which type of free capsules you've opened, and predicts the type of the next one.  It can do this because the free capsules are given out in a predetermined cycle.

## How to use

Hosted at: <https://zephyron1237.github.io/adcom-capsule-tracker/>

Click on capsules in the "Add Capsule" section to add them to your history, or the "minus" symbol to remove the last one.  The "Next Capsule" section will automatically update with chances for the next capsule's type, and the "Cycle" section will visually highlight each possibility.  Eventually, you should be able to figure out exactly where you are and reliably predict the future.

You can click a capsule in the "Cycle" section" to set it as your starting capsule.  If you already have added history, it will be placed before your first capsule.  You can also use wildcards instead of capsules; the first one (?) matches any single capsule and can be used if you know exactly how many capsules you've forgotten to record, and the second one (?≤5) will match 1-5 capsules, in case you've forgotten to record for a day and cannot remember exactly how many you opened.  If additional parameters are added to the url (e.g., ?mode=event&input=PA&start=1) they will be used to override the current save data, and such export/import URL's can be accessed by pressing the "export" button next to "minus."

## Thanks

The cycle data and the images are taken from the [Fandom Wiki](https://adventurecommunist.fandom.com/wiki/Free_capsules).  Some code and inspiration taken from [Scripter17's Capsule Finder](https://github.com/scripter17/adcomm-capsule-finder/).

## Contributing

I welcome any feedback, bug reports, or pull requests.

## License

Feel free to use this however you want, especially since I will probably won't update the tool for the rest of the game's lifespan, though credit is always appreciated.
