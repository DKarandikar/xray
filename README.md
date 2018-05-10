# xray / data controller indicators for smartphone apps

# Pipeline 1: Dynamic analysis

In this pipeline we will donwload and install apps from the app store, set up mitmproxy, interact with the apps, and do some analysis on their traffic.

## capture logs (dynamic approach)


Procedure for capturing data on a device:

0. Check out the repo
1. Create a virtualenv, enter the virtualenv; pip install mitmproxy
2. Install mitmproxy ca as a root ca on device
3. Terminate all running apps on device and connect to network that mitmproxy is running on
4. Set http proxy to mitm-host:8080
5. Create your own `mitm-config.json` and edit for app of choice with your details
6. Run `mitmdump -s mitm-save.py -p 8080`
7. Launch target app on device
8. Do stuff on device for awhile, then terminate proxy then terminate app

You should see traffic on your local console, and logs to be saved in the directory specified in your mitm-config.json file. 

Alternatively using the transparent mitmproxy:

4. Run `transparent.sh` (requires `jq` and edits `mitm-config` via command line input)
5. Launch target app on decive 
6. Do stuff, terminate script, terminate app

Results should be the same but no need to setup HTTP proxy on the device, only install the CA

## process the logs

1. create a copy of `config.sample.json` called `config.json`
2. you need bower, make sure you have it (or `npm install -g bower`)
3. at the top level, run `bower install`
4. go to the mitm directory
5. run `npm install`
6. make a 'mitm_out' directory (or whatever destination you specified in `config.json`)
7. run `node parse-output.js` to generate the data files 
8. stand at the base directory, run `http-server`
9. point a browser to to localhost:8080/prototypes/p1.html

## tcpDump IP capture

1. Edit `pcap_filtering/TcpCapture.sh` for correct interface (wlan0 by default) and run
2. Interact with device on specified network
3. Run `pcap_filtering/ExtractIPs.py [file]`

Produces a .txt file with all IPs in the directory `pcap_filtering/ips`

## Automated MITM traffic logging

Another way is to use monkey to simulate user events. Logs traffic data using mitmproxy.

Requires Android Developer Studio tools (for monkeyrunner)

Requires rooted phone with adb root shell access, network log tool with superuser permissions.

Requires working mitmproxy setting up, as described above.

1. Edit `logger.sh` to specify packages to log
2. turn on network logging on the device
3. Activate the python virtual environment in xray directory, run `mitmdump -s mitm-save.py -p 8080`
4. Run `logger.sh` to start UI fuzzing on packages and logging mitmproxy traffic in the background
5. When the fuzzer has done its business, `Ctrl+C` the mitmproxy logging.
6. There will be a big CSV in the data directory. It can be split into smaller csvs for each app using `csplit filename.csv 'endsession_apppackagename'` (an ugly solution, will do for now!). Place in the data directory
7. export network log data from device, place in the data directory
8. auto-cleaner.py is work in progress, it uses the network log to filter out non-app traffic from the mitmproxy log csv file.


# Pipeline 2: Static analysis

In this pipeline we will install apps from the app store, using an automated UI on an android device, pull the APKs from the device, do some static code analysis on the APKs using LibRadar, and store the results of further analysis.

## Dependencies

Ensure you have JDK version 1.8.0_25

## Downloading APKs via the app store
Requires root access to the android device.

1. Install android-developer-tools.
2. Get the device id adb devices
3. Modify `install-from-store-random-motog.py` with the device id.
4. Start ADB demon as root adb root
5. Run `python install-from-store-random-motog.py`

This should result in the APK files being written to a directory outside the repo called `apks`

## Static analysis

1. Adjust the path in `static/config.json` to point to your APK folder
2. in the `static` directory, run `node ./trie.js`
3. this should write the LibRadar output to json files in the output directory
4. Todo: hostsearch.py 

