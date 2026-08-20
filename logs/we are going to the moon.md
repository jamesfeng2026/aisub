[00:06:37] [info] handleTask start
[00:06:37] [info] formData: 
 {
  "sourceLanguage": "en",
  "targetLanguage": "zh",
  "customTargetSrtFileName": "${fileName}.${targetLanguage}",
  "customSourceSrtFileName": "${fileName}.${sourceLanguage}",
  "transcriptionEngine": "builtin",
  "model": "medium",
  "translateProvider": "Gemini",
  "translateContent": "sourceAndTranslate",
  "maxConcurrentTasks": 1,
  "sourceSrtSaveOption": "fileName",
  "targetSrtSaveOption": "fileNameWithLang",
  "subtitleOutputFormat": "lrc",
  "maxSubtitleChars": 0,
  "removeChinesePunctuation": false,
  "subtitleOutcome": "balanced",
  "taskType": "generateOnly",
  "asrProviderId": "",
  "aiCorrection": true,
  "refineProvider": "Gemini",
  "aiSegmentation": false,
  "prompt": "Strict transcription requirements:\n1. Keep the original complete sentence content, add standard commas, periods, question marks and semicolons accurately.\n2. For long complex English sentences, split preferentially at dividing points of main clauses, attributive clauses, adverbial clauses guided by that, which, when, because, if, although.\n3. Only split sentences at punctuation marks and clause boundaries, never split any word or phrase in the middle.\n4. Each segmented subtitle must have complete independent semantics, avoid fragmented short sentences.",
  "translateRetryTimes": "2"
}
[00:06:37] [info] begin process We're going to the moon童谣歌曲 with task type: generateOnly
[00:06:37] [info] extract audio for We're going to the moon童谣歌曲
[00:06:37] [info] tempDir: /var/folders/qr/z18gt9zx1r37fvwxv_m9db480000gp/T/whisper-subtitles
[00:06:37] [info] Using existing audio file: /var/folders/qr/z18gt9zx1r37fvwxv_m9db480000gp/T/whisper-subtitles/215758ba1af242a2801a9b626fa06f95.wav
[00:06:37] [info] generate subtitle /Users/fjm/Documents/丰雨桐/26年暑假/062626 二年级英语暑假作业/1-8 周英语儿歌/We're going to the moon童谣歌曲.srt
[00:06:37] [info] whisperParams: {
  "language": "en",
  "model": "/Users/fjm/Library/Application Support/smartsub/whisper-models/ggml-medium.bin",
  "fname_inp": "/var/folders/qr/z18gt9zx1r37fvwxv_m9db480000gp/T/whisper-subtitles/215758ba1af242a2801a9b626fa06f95.wav",
  "use_gpu": false,
  "flash_attn": false,
  "no_prints": false,
  "comma_in_time": false,
  "translate": false,
  "no_timestamps": false,
  "audio_ctx": 0,
  "token_timestamps": "[REDACTED]",
  "max_len": 0,
  "print_progress": true,
  "prompt": "Strict transcription requirements:\n1. Keep the original complete sentence content, add standard commas, periods, question marks and semicolons accurately.\n2. For long complex English sentences, split preferentially at dividing points of main clauses, attributive clauses, adverbial clauses guided by that, which, when, because, if, although.\n3. Only split sentences at punctuation marks and clause boundaries, never split any word or phrase in the middle.\n4. Each segmented subtitle must have complete independent semantics, avoid fragmented short sentences.",
  "max_context": -1,
  "vad": false,
  "signal": "[AbortSignal]"
}
[00:07:48] [info] [We're going to the moon童谣歌曲] raw nativeTokens from whisper (202 tokens, showing first 202):
  [  0] 1.850s-2.330s  (dur=480ms)  " zoom"  p=0.071
  [  1] 2.390s-4.650s  (dur=2260ms)  " zoom"  p=0.402
  [  2] 4.660s-6.900s  (dur=2240ms)  " zoom"  p=0.964
  [  3] 7.070s-7.170s  (dur=100ms)  ","  p=0.283
  [  4] 7.170s-7.340s  (dur=170ms)  " we"  p=0.895
  [  5] 7.340s-7.600s  (dur=260ms)  "'re"  p=0.939
  [  6] 7.600s-8.040s  (dur=440ms)  " going"  p=0.995
  [  7] 8.040s-8.210s  (dur=170ms)  " to"  p=0.995
  [  8] 8.210s-8.470s  (dur=260ms)  " the"  p=0.989
  [  9] 8.470s-8.830s  (dur=360ms)  " moon"  p=0.958
  [ 10] 8.880s-9.790s  (dur=910ms)  " zoom"  p=0.351
  [ 11] 9.840s-10.780s  (dur=940ms)  " zoom"  p=0.985
  [ 12] 10.780s-11.730s  (dur=950ms)  " zoom"  p=0.992
  [ 13] 11.730s-12.200s  (dur=470ms)  ","  p=0.931
  [ 14] 12.200s-12.670s  (dur=470ms)  " we"  p=0.984
  [ 15] 12.670s-13.380s  (dur=710ms)  "'re"  p=0.989
  [ 16] 13.380s-14.570s  (dur=1190ms)  " going"  p=0.981
  [ 17] 14.570s-15.030s  (dur=460ms)  " to"  p=0.995
  [ 18] 15.080s-15.750s  (dur=670ms)  " the"  p=0.995
  [ 19] 15.750s-16.640s  (dur=890ms)  " moon"  p=0.997
  [ 20] 16.760s-17.200s  (dur=440ms)  " zoom"  p=0.937
  [ 21] 17.200s-17.640s  (dur=440ms)  " zoom"  p=0.993
  [ 22] 17.640s-18.080s  (dur=440ms)  " zoom"  p=0.997
  [ 23] 18.300s-18.300s  (dur=0ms)  ","  p=0.970
  [ 24] 18.520s-18.520s  (dur=0ms)  " we"  p=0.990
  [ 25] 18.630s-18.850s  (dur=220ms)  "'re"  p=0.995
  [ 26] 18.990s-19.620s  (dur=630ms)  " leaving"  p=0.990
  [ 27] 19.620s-20.040s  (dur=420ms)  " very"  p=0.993
  [ 28] 20.060s-20.510s  (dur=450ms)  " soon"  p=0.999
  [ 29] 20.510s-20.720s  (dur=210ms)  " if"  p=0.550
  [ 30] 20.720s-20.960s  (dur=240ms)  " you"  p=0.997
  [ 31] 21.050s-21.410s  (dur=360ms)  " want"  p=0.994
  [ 32] 21.420s-21.620s  (dur=200ms)  " to"  p=0.996
  [ 33] 21.620s-22.020s  (dur=400ms)  " take"  p=0.995
  [ 34] 22.020s-22.120s  (dur=100ms)  " a"  p=0.996
  [ 35] 22.120s-22.560s  (dur=440ms)  " trip"  p=0.992
  [ 36] 22.560s-22.640s  (dur=80ms)  ","  p=0.895
  [ 37] 22.640s-22.960s  (dur=320ms)  " climb"  p=0.950
  [ 38] 22.960s-23.340s  (dur=380ms)  " aboard"  p=0.965
  [ 39] 23.340s-23.470s  (dur=130ms)  " my"  p=0.989
  [ 40] 23.470s-23.990s  (dur=520ms)  " rocket"  p=0.922
  [ 41] 24.000s-25.000s  (dur=1000ms)  " ship"  p=0.762
  [ 42] 25.000s-25.320s  (dur=320ms)  " zoom"  p=0.437
  [ 43] 25.640s-25.640s  (dur=0ms)  " zoom"  p=0.997
  [ 44] 25.850s-25.960s  (dur=110ms)  " zoom"  p=0.997
  [ 45] 25.960s-26.110s  (dur=150ms)  ","  p=0.987
  [ 46] 26.110s-26.270s  (dur=160ms)  " we"  p=0.997
  [ 47] 26.270s-26.500s  (dur=230ms)  "'re"  p=0.998
  [ 48] 26.500s-26.880s  (dur=380ms)  " going"  p=0.999
  [ 49] 26.910s-27.050s  (dur=140ms)  " to"  p=0.999
  [ 50] 27.050s-27.280s  (dur=230ms)  " the"  p=0.998
  [ 51] 27.280s-27.640s  (dur=360ms)  " moon"  p=0.998
  [ 52] 29.810s-31.230s  (dur=1420ms)  " zoom"  p=0.669
  [ 53] 31.230s-34.810s  (dur=3580ms)  " zoom"  p=0.965
  [ 54] 34.840s-38.410s  (dur=3570ms)  " zoom"  p=0.993
  [ 55] 38.410s-40.200s  (dur=1790ms)  ","  p=0.966
  [ 56] 40.200s-42.000s  (dur=1800ms)  " we"  p=0.953
  [ 57] 42.000s-44.590s  (dur=2590ms)  "'re"  p=0.996
  [ 58] 44.810s-49.160s  (dur=4350ms)  " going"  p=0.994
  [ 59] 49.160s-50.960s  (dur=1800ms)  " to"  p=0.997
  [ 60] 50.960s-53.650s  (dur=2690ms)  " the"  p=0.995
  [ 61] 53.650s-57.190s  (dur=3540ms)  " moon"  p=0.996
  [ 62] 57.280s-57.770s  (dur=490ms)  " zoom"  p=0.789
  [ 63] 57.770s-58.260s  (dur=490ms)  " zoom"  p=0.972
  [ 64] 58.260s-58.750s  (dur=490ms)  " zoom"  p=0.974
  [ 65] 58.930s-58.990s  (dur=60ms)  ","  p=0.989
  [ 66] 59.130s-59.240s  (dur=110ms)  " we"  p=0.990
  [ 67] 59.240s-59.610s  (dur=370ms)  "'re"  p=0.996
  [ 68] 59.670s-60.480s  (dur=810ms)  " leaving"  p=0.849
  [ 69] 60.480s-60.970s  (dur=490ms)  " very"  p=0.997
  [ 70] 60.970s-61.480s  (dur=510ms)  " soon"  p=0.999
  [ 71] 61.580s-61.670s  (dur=90ms)  " if"  p=0.741
  [ 72] 61.670s-61.890s  (dur=220ms)  " you"  p=0.999
  [ 73] 61.890s-62.190s  (dur=300ms)  " want"  p=0.999
  [ 74] 62.190s-62.340s  (dur=150ms)  " to"  p=0.997
  [ 75] 62.340s-62.640s  (dur=300ms)  " take"  p=0.998
  [ 76] 62.640s-62.710s  (dur=70ms)  " a"  p=0.999
  [ 77] 62.710s-63.010s  (dur=300ms)  " trip"  p=0.999
  [ 78] 63.010s-63.160s  (dur=150ms)  ","  p=0.989
  [ 79] 63.160s-63.530s  (dur=370ms)  " climb"  p=0.978
  [ 80] 63.530s-63.980s  (dur=450ms)  " aboard"  p=0.998
  [ 81] 63.980s-64.150s  (dur=170ms)  " my"  p=0.992
  [ 82] 64.150s-64.640s  (dur=490ms)  " rocket"  p=0.951
  [ 83] 64.640s-65.640s  (dur=1000ms)  " ship"  p=0.811
  [ 84] 65.640s-66.000s  (dur=360ms)  " zoom"  p=0.862
  [ 85] 66.290s-66.360s  (dur=70ms)  " zoom"  p=0.998
  [ 86] 66.510s-66.720s  (dur=210ms)  " zoom"  p=0.995
  [ 87] 66.720s-66.900s  (dur=180ms)  ","  p=0.995
  [ 88] 66.900s-67.080s  (dur=180ms)  " we"  p=0.998
  [ 89] 67.080s-67.350s  (dur=270ms)  "'re"  p=0.998
  [ 90] 67.350s-67.800s  (dur=450ms)  " going"  p=1.000
  [ 91] 67.800s-67.960s  (dur=160ms)  " to"  p=0.999
  [ 92] 67.980s-68.250s  (dur=270ms)  " the"  p=0.997
  [ 93] 68.250s-68.640s  (dur=390ms)  " moon"  p=0.998
  [ 94] 70.560s-71.510s  (dur=950ms)  " zoom"  p=0.876
  [ 95] 71.510s-74.380s  (dur=2870ms)  " zoom"  p=0.989
  [ 96] 74.380s-77.250s  (dur=2870ms)  " zoom"  p=0.994
  [ 97] 77.250s-78.680s  (dur=1430ms)  ","  p=0.994
  [ 98] 78.680s-80.110s  (dur=1430ms)  " we"  p=0.989
  [ 99] 80.110s-82.250s  (dur=2140ms)  "'re"  p=0.997
  [100] 82.250s-85.810s  (dur=3560ms)  " going"  p=0.994
  [101] 85.850s-87.260s  (dur=1410ms)  " to"  p=0.997
  [102] 87.260s-89.290s  (dur=2030ms)  " the"  p=0.995
  [103] 89.540s-92.320s  (dur=2780ms)  " moon"  p=0.998
  [104] 92.320s-93.250s  (dur=930ms)  " zoom"  p=0.888
  [105] 94.160s-94.180s  (dur=20ms)  " zoom"  p=0.978
  [106] 94.540s-95.110s  (dur=570ms)  " zoom"  p=0.984
  [107] 95.110s-95.570s  (dur=460ms)  ","  p=0.980
  [108] 95.570s-96.030s  (dur=460ms)  " we"  p=0.985
  [109] 96.030s-96.720s  (dur=690ms)  "'re"  p=0.997
  [110] 96.720s-97.870s  (dur=1150ms)  " going"  p=0.779
  [111] 97.890s-98.340s  (dur=450ms)  " to"  p=0.996
  [112] 98.340s-99.030s  (dur=690ms)  " the"  p=0.989
  [113] 99.030s-100.000s  (dur=970ms)  " moon"  p=0.998
  [114] 100.000s-100.530s  (dur=530ms)  " zoom"  p=0.863
  [115] 100.530s-101.060s  (dur=530ms)  " zoom"  p=0.996
  [116] 101.590s-101.590s  (dur=0ms)  " zoom"  p=0.997
  [117] 101.840s-101.850s  (dur=10ms)  ","  p=0.996
  [118] 101.870s-102.110s  (dur=240ms)  " we"  p=0.996
  [119] 102.220s-102.510s  (dur=290ms)  "'re"  p=0.999
  [120] 102.510s-103.440s  (dur=930ms)  " leaving"  p=0.968
  [121] 103.440s-103.970s  (dur=530ms)  " very"  p=0.999
  [122] 103.970s-104.560s  (dur=590ms)  " soon"  p=1.000
  [123] 104.560s-104.710s  (dur=150ms)  " if"  p=0.707
  [124] 104.710s-104.930s  (dur=220ms)  " you"  p=0.999
  [125] 104.950s-105.230s  (dur=280ms)  " want"  p=0.998
  [126] 105.230s-105.380s  (dur=150ms)  " to"  p=0.998
  [127] 105.380s-105.680s  (dur=300ms)  " take"  p=0.999
  [128] 105.680s-105.750s  (dur=70ms)  " a"  p=0.999
  [129] 105.750s-106.040s  (dur=290ms)  " trip"  p=0.999
  [130] 106.040s-106.200s  (dur=160ms)  ","  p=0.993
  [131] 106.200s-106.570s  (dur=370ms)  " climb"  p=0.994
  [132] 106.570s-106.900s  (dur=330ms)  " aboard"  p=0.998
  [133] 107.070s-107.200s  (dur=130ms)  " my"  p=0.993
  [134] 107.200s-107.720s  (dur=520ms)  " rocket"  p=0.855
  [135] 107.720s-108.720s  (dur=1000ms)  " ship"  p=0.847
  [136] 108.720s-109.080s  (dur=360ms)  " zoom"  p=0.590
  [137] 109.080s-109.440s  (dur=360ms)  " zoom"  p=0.999
  [138] 109.440s-109.800s  (dur=360ms)  " zoom"  p=0.998
  [139] 109.800s-109.980s  (dur=180ms)  ","  p=0.998
  [140] 109.980s-110.160s  (dur=180ms)  " we"  p=0.998
  [141] 110.370s-110.430s  (dur=60ms)  "'re"  p=0.999
  [142] 110.590s-110.880s  (dur=290ms)  " going"  p=1.000
  [143] 110.890s-111.060s  (dur=170ms)  " to"  p=1.000
  [144] 111.110s-111.330s  (dur=220ms)  " the"  p=0.999
  [145] 111.330s-111.720s  (dur=390ms)  " moon"  p=0.999
  [146] 113.890s-115.310s  (dur=1420ms)  " zoom"  p=0.868
  [147] 115.310s-118.890s  (dur=3580ms)  " zoom"  p=0.987
  [148] 118.920s-122.490s  (dur=3570ms)  " zoom"  p=0.992
  [149] 122.490s-124.280s  (dur=1790ms)  ","  p=0.971
  [150] 124.280s-126.080s  (dur=1800ms)  " we"  p=0.977
  [151] 126.080s-128.670s  (dur=2590ms)  "'re"  p=0.997
  [152] 128.890s-133.260s  (dur=4370ms)  " going"  p=0.895
  [153] 133.260s-135.060s  (dur=1800ms)  " to"  p=0.998
  [154] 135.060s-137.760s  (dur=2700ms)  " the"  p=0.997
  [155] 137.760s-141.270s  (dur=3510ms)  " moon"  p=0.997
  [156] 141.400s-141.840s  (dur=440ms)  " zoom"  p=0.975
  [157] 141.840s-142.280s  (dur=440ms)  " zoom"  p=0.990
  [158] 142.280s-142.720s  (dur=440ms)  " zoom"  p=0.996
  [159] 142.940s-142.940s  (dur=0ms)  ","  p=0.988
  [160] 143.160s-143.160s  (dur=0ms)  " we"  p=0.997
  [161] 143.270s-143.490s  (dur=220ms)  "'re"  p=0.999
  [162] 143.630s-144.270s  (dur=640ms)  " leaving"  p=0.958
  [163] 144.270s-144.700s  (dur=430ms)  " very"  p=0.999
  [164] 144.700s-145.200s  (dur=500ms)  " soon"  p=1.000
  [165] 145.200s-145.350s  (dur=150ms)  " if"  p=0.566
  [166] 145.350s-145.570s  (dur=220ms)  " you"  p=0.999
  [167] 145.570s-145.870s  (dur=300ms)  " want"  p=0.999
  [168] 145.870s-146.010s  (dur=140ms)  " to"  p=0.998
  [169] 146.010s-146.320s  (dur=310ms)  " take"  p=0.999
  [170] 146.320s-146.390s  (dur=70ms)  " a"  p=0.999
  [171] 146.390s-146.690s  (dur=300ms)  " trip"  p=1.000
  [172] 146.690s-146.840s  (dur=150ms)  ","  p=0.995
  [173] 146.840s-147.210s  (dur=370ms)  " climb"  p=0.989
  [174] 147.210s-147.660s  (dur=450ms)  " aboard"  p=0.999
  [175] 147.660s-147.840s  (dur=180ms)  " my"  p=0.994
  [176] 147.840s-148.300s  (dur=460ms)  " rocket"  p=0.910
  [177] 148.320s-149.320s  (dur=1000ms)  " ship"  p=0.972
  [178] 149.320s-149.680s  (dur=360ms)  " zoom"  p=0.991
  [179] 149.680s-150.040s  (dur=360ms)  " zoom"  p=0.999
  [180] 150.040s-150.400s  (dur=360ms)  " zoom"  p=0.998
  [181] 150.400s-150.580s  (dur=180ms)  ","  p=0.997
  [182] 150.580s-150.760s  (dur=180ms)  " we"  p=0.998
  [183] 150.970s-151.030s  (dur=60ms)  "'re"  p=0.999
  [184] 151.190s-151.480s  (dur=290ms)  " going"  p=1.000
  [185] 151.490s-151.660s  (dur=170ms)  " to"  p=1.000
  [186] 151.710s-151.930s  (dur=220ms)  " the"  p=0.999
  [187] 151.930s-152.320s  (dur=390ms)  " moon"  p=0.999
  [188] 152.320s-153.320s  (dur=1000ms)  " 5"  p=0.559
  [189] 154.160s-154.320s  (dur=160ms)  ","  p=0.327
  [190] 154.550s-155.420s  (dur=870ms)  " 4"  p=0.705
  [191] 155.420s-156.140s  (dur=720ms)  ","  p=0.993
  [192] 156.140s-157.250s  (dur=1110ms)  " 3"  p=0.996
  [193] 157.260s-157.980s  (dur=720ms)  ","  p=0.994
  [194] 157.980s-159.080s  (dur=1100ms)  " 2"  p=0.994
  [195] 159.080s-159.810s  (dur=730ms)  ","  p=0.992
  [196] 159.820s-160.920s  (dur=1100ms)  " 1"  p=0.994
  [197] 160.920s-161.290s  (dur=370ms)  ","  p=0.518
  [198] 161.290s-161.850s  (dur=560ms)  " Let"  p=0.455
  [199] 161.850s-162.220s  (dur=370ms)  "'s"  p=0.997
  [200] 162.220s-162.590s  (dur=370ms)  " Go"  p=0.436
  [201] 162.590s-163.160s  (dur=570ms)  "!"  p=0.747
[00:07:49] [info] Silero VAD: 12 speech segments
[00:07:49] [info] [We're going to the moon童谣歌曲] triples (202, showing first 202):
  [  0] 00:00:01,850 -> 00:00:02,330  " zoom"
  [  1] 00:00:02,390 -> 00:00:04,650  " zoom"
  [  2] 00:00:04,660 -> 00:00:06,900  " zoom"
  [  3] 00:00:07,070 -> 00:00:07,170  ","
  [  4] 00:00:07,170 -> 00:00:07,340  " we"
  [  5] 00:00:07,340 -> 00:00:07,600  "'re"
  [  6] 00:00:07,600 -> 00:00:08,040  " going"
  [  7] 00:00:08,040 -> 00:00:08,210  " to"
  [  8] 00:00:08,210 -> 00:00:08,470  " the"
  [  9] 00:00:08,470 -> 00:00:08,830  " moon"
  [ 10] 00:00:08,880 -> 00:00:09,790  " zoom"
  [ 11] 00:00:09,840 -> 00:00:10,780  " zoom"
  [ 12] 00:00:10,780 -> 00:00:11,730  " zoom"
  [ 13] 00:00:11,730 -> 00:00:12,200  ","
  [ 14] 00:00:12,200 -> 00:00:12,670  " we"
  [ 15] 00:00:12,670 -> 00:00:13,380  "'re"
  [ 16] 00:00:13,380 -> 00:00:14,570  " going"
  [ 17] 00:00:14,570 -> 00:00:15,030  " to"
  [ 18] 00:00:15,080 -> 00:00:15,750  " the"
  [ 19] 00:00:15,750 -> 00:00:16,640  " moon"
  [ 20] 00:00:16,760 -> 00:00:17,200  " zoom"
  [ 21] 00:00:17,200 -> 00:00:17,640  " zoom"
  [ 22] 00:00:17,640 -> 00:00:18,080  " zoom"
  [ 23] 00:00:18,300 -> 00:00:18,300  ","
  [ 24] 00:00:18,520 -> 00:00:18,520  " we"
  [ 25] 00:00:18,630 -> 00:00:18,850  "'re"
  [ 26] 00:00:18,990 -> 00:00:19,620  " leaving"
  [ 27] 00:00:19,620 -> 00:00:20,040  " very"
  [ 28] 00:00:20,060 -> 00:00:20,510  " soon"
  [ 29] 00:00:20,510 -> 00:00:20,720  " if"
  [ 30] 00:00:20,720 -> 00:00:20,960  " you"
  [ 31] 00:00:21,050 -> 00:00:21,410  " want"
  [ 32] 00:00:21,420 -> 00:00:21,620  " to"
  [ 33] 00:00:21,620 -> 00:00:22,020  " take"
  [ 34] 00:00:22,020 -> 00:00:22,120  " a"
  [ 35] 00:00:22,120 -> 00:00:22,560  " trip"
  [ 36] 00:00:22,560 -> 00:00:22,640  ","
  [ 37] 00:00:22,640 -> 00:00:22,960  " climb"
  [ 38] 00:00:22,960 -> 00:00:23,340  " aboard"
  [ 39] 00:00:23,340 -> 00:00:23,470  " my"
  [ 40] 00:00:23,470 -> 00:00:23,990  " rocket"
  [ 41] 00:00:24,000 -> 00:00:25,000  " ship"
  [ 42] 00:00:25,000 -> 00:00:25,320  " zoom"
  [ 43] 00:00:25,640 -> 00:00:25,640  " zoom"
  [ 44] 00:00:25,850 -> 00:00:25,960  " zoom"
  [ 45] 00:00:25,960 -> 00:00:26,110  ","
  [ 46] 00:00:26,110 -> 00:00:26,270  " we"
  [ 47] 00:00:26,270 -> 00:00:26,500  "'re"
  [ 48] 00:00:26,500 -> 00:00:26,880  " going"
  [ 49] 00:00:26,910 -> 00:00:27,050  " to"
  [ 50] 00:00:27,050 -> 00:00:27,280  " the"
  [ 51] 00:00:27,280 -> 00:00:27,640  " moon"
  [ 52] 00:00:29,810 -> 00:00:31,230  " zoom"
  [ 53] 00:00:31,230 -> 00:00:34,810  " zoom"
  [ 54] 00:00:34,840 -> 00:00:38,410  " zoom"
  [ 55] 00:00:38,410 -> 00:00:40,200  ","
  [ 56] 00:00:40,200 -> 00:00:42,000  " we"
  [ 57] 00:00:42,000 -> 00:00:44,590  "'re"
  [ 58] 00:00:44,810 -> 00:00:49,160  " going"
  [ 59] 00:00:49,160 -> 00:00:50,960  " to"
  [ 60] 00:00:50,960 -> 00:00:53,650  " the"
  [ 61] 00:00:53,650 -> 00:00:57,190  " moon"
  [ 62] 00:00:57,280 -> 00:00:57,770  " zoom"
  [ 63] 00:00:57,770 -> 00:00:58,260  " zoom"
  [ 64] 00:00:58,260 -> 00:00:58,750  " zoom"
  [ 65] 00:00:58,930 -> 00:00:58,990  ","
  [ 66] 00:00:59,130 -> 00:00:59,240  " we"
  [ 67] 00:00:59,240 -> 00:00:59,610  "'re"
  [ 68] 00:00:59,670 -> 00:01:00,480  " leaving"
  [ 69] 00:01:00,480 -> 00:01:00,970  " very"
  [ 70] 00:01:00,970 -> 00:01:01,480  " soon"
  [ 71] 00:01:01,580 -> 00:01:01,670  " if"
  [ 72] 00:01:01,670 -> 00:01:01,890  " you"
  [ 73] 00:01:01,890 -> 00:01:02,190  " want"
  [ 74] 00:01:02,190 -> 00:01:02,340  " to"
  [ 75] 00:01:02,340 -> 00:01:02,640  " take"
  [ 76] 00:01:02,640 -> 00:01:02,710  " a"
  [ 77] 00:01:02,710 -> 00:01:03,010  " trip"
  [ 78] 00:01:03,010 -> 00:01:03,160  ","
  [ 79] 00:01:03,160 -> 00:01:03,530  " climb"
  [ 80] 00:01:03,530 -> 00:01:03,980  " aboard"
  [ 81] 00:01:03,980 -> 00:01:04,150  " my"
  [ 82] 00:01:04,150 -> 00:01:04,640  " rocket"
  [ 83] 00:01:04,640 -> 00:01:05,640  " ship"
  [ 84] 00:01:05,640 -> 00:01:06,000  " zoom"
  [ 85] 00:01:06,290 -> 00:01:06,360  " zoom"
  [ 86] 00:01:06,510 -> 00:01:06,720  " zoom"
  [ 87] 00:01:06,720 -> 00:01:06,900  ","
  [ 88] 00:01:06,900 -> 00:01:07,080  " we"
  [ 89] 00:01:07,080 -> 00:01:07,350  "'re"
  [ 90] 00:01:07,350 -> 00:01:07,800  " going"
  [ 91] 00:01:07,800 -> 00:01:07,960  " to"
  [ 92] 00:01:07,980 -> 00:01:08,250  " the"
  [ 93] 00:01:08,250 -> 00:01:08,640  " moon"
  [ 94] 00:01:10,560 -> 00:01:11,510  " zoom"
  [ 95] 00:01:11,510 -> 00:01:14,380  " zoom"
  [ 96] 00:01:14,380 -> 00:01:17,250  " zoom"
  [ 97] 00:01:17,250 -> 00:01:18,680  ","
  [ 98] 00:01:18,680 -> 00:01:20,110  " we"
  [ 99] 00:01:20,110 -> 00:01:22,250  "'re"
  [100] 00:01:22,250 -> 00:01:25,810  " going"
  [101] 00:01:25,850 -> 00:01:27,260  " to"
  [102] 00:01:27,260 -> 00:01:29,290  " the"
  [103] 00:01:29,540 -> 00:01:32,320  " moon"
  [104] 00:01:32,320 -> 00:01:33,250  " zoom"
  [105] 00:01:34,160 -> 00:01:34,180  " zoom"
  [106] 00:01:34,540 -> 00:01:35,110  " zoom"
  [107] 00:01:35,110 -> 00:01:35,570  ","
  [108] 00:01:35,570 -> 00:01:36,030  " we"
  [109] 00:01:36,030 -> 00:01:36,720  "'re"
  [110] 00:01:36,720 -> 00:01:37,870  " going"
  [111] 00:01:37,890 -> 00:01:38,340  " to"
  [112] 00:01:38,340 -> 00:01:39,030  " the"
  [113] 00:01:39,030 -> 00:01:40,000  " moon"
  [114] 00:01:40,000 -> 00:01:40,530  " zoom"
  [115] 00:01:40,530 -> 00:01:41,060  " zoom"
  [116] 00:01:41,590 -> 00:01:41,590  " zoom"
  [117] 00:01:41,840 -> 00:01:41,850  ","
  [118] 00:01:41,870 -> 00:01:42,110  " we"
  [119] 00:01:42,220 -> 00:01:42,510  "'re"
  [120] 00:01:42,510 -> 00:01:43,440  " leaving"
  [121] 00:01:43,440 -> 00:01:43,970  " very"
  [122] 00:01:43,970 -> 00:01:44,560  " soon"
  [123] 00:01:44,560 -> 00:01:44,710  " if"
  [124] 00:01:44,710 -> 00:01:44,930  " you"
  [125] 00:01:44,950 -> 00:01:45,230  " want"
  [126] 00:01:45,230 -> 00:01:45,380  " to"
  [127] 00:01:45,380 -> 00:01:45,680  " take"
  [128] 00:01:45,680 -> 00:01:45,750  " a"
  [129] 00:01:45,750 -> 00:01:46,040  " trip"
  [130] 00:01:46,040 -> 00:01:46,200  ","
  [131] 00:01:46,200 -> 00:01:46,570  " climb"
  [132] 00:01:46,570 -> 00:01:46,900  " aboard"
  [133] 00:01:47,070 -> 00:01:47,200  " my"
  [134] 00:01:47,200 -> 00:01:47,720  " rocket"
  [135] 00:01:47,720 -> 00:01:48,720  " ship"
  [136] 00:01:48,720 -> 00:01:49,080  " zoom"
  [137] 00:01:49,080 -> 00:01:49,440  " zoom"
  [138] 00:01:49,440 -> 00:01:49,800  " zoom"
  [139] 00:01:49,800 -> 00:01:49,980  ","
  [140] 00:01:49,980 -> 00:01:50,160  " we"
  [141] 00:01:50,370 -> 00:01:50,430  "'re"
  [142] 00:01:50,590 -> 00:01:50,880  " going"
  [143] 00:01:50,890 -> 00:01:51,060  " to"
  [144] 00:01:51,110 -> 00:01:51,330  " the"
  [145] 00:01:51,330 -> 00:01:51,720  " moon"
  [146] 00:01:53,890 -> 00:01:55,310  " zoom"
  [147] 00:01:55,310 -> 00:01:58,890  " zoom"
  [148] 00:01:58,920 -> 00:02:02,490  " zoom"
  [149] 00:02:02,490 -> 00:02:04,280  ","
  [150] 00:02:04,280 -> 00:02:06,080  " we"
  [151] 00:02:06,080 -> 00:02:08,670  "'re"
  [152] 00:02:08,890 -> 00:02:13,260  " going"
  [153] 00:02:13,260 -> 00:02:15,060  " to"
  [154] 00:02:15,060 -> 00:02:17,760  " the"
  [155] 00:02:17,760 -> 00:02:21,270  " moon"
  [156] 00:02:21,400 -> 00:02:21,840  " zoom"
  [157] 00:02:21,840 -> 00:02:22,280  " zoom"
  [158] 00:02:22,280 -> 00:02:22,720  " zoom"
  [159] 00:02:22,940 -> 00:02:22,940  ","
  [160] 00:02:23,160 -> 00:02:23,160  " we"
  [161] 00:02:23,270 -> 00:02:23,490  "'re"
  [162] 00:02:23,630 -> 00:02:24,270  " leaving"
  [163] 00:02:24,270 -> 00:02:24,700  " very"
  [164] 00:02:24,700 -> 00:02:25,200  " soon"
  [165] 00:02:25,200 -> 00:02:25,350  " if"
  [166] 00:02:25,350 -> 00:02:25,570  " you"
  [167] 00:02:25,570 -> 00:02:25,870  " want"
  [168] 00:02:25,870 -> 00:02:26,010  " to"
  [169] 00:02:26,010 -> 00:02:26,320  " take"
  [170] 00:02:26,320 -> 00:02:26,390  " a"
  [171] 00:02:26,390 -> 00:02:26,690  " trip"
  [172] 00:02:26,690 -> 00:02:26,840  ","
  [173] 00:02:26,840 -> 00:02:27,210  " climb"
  [174] 00:02:27,210 -> 00:02:27,660  " aboard"
  [175] 00:02:27,660 -> 00:02:27,840  " my"
  [176] 00:02:27,840 -> 00:02:28,300  " rocket"
  [177] 00:02:28,320 -> 00:02:29,320  " ship"
  [178] 00:02:29,320 -> 00:02:29,680  " zoom"
  [179] 00:02:29,680 -> 00:02:30,040  " zoom"
  [180] 00:02:30,040 -> 00:02:30,400  " zoom"
  [181] 00:02:30,400 -> 00:02:30,580  ","
  [182] 00:02:30,580 -> 00:02:30,760  " we"
  [183] 00:02:30,970 -> 00:02:31,030  "'re"
  [184] 00:02:31,190 -> 00:02:31,480  " going"
  [185] 00:02:31,490 -> 00:02:31,660  " to"
  [186] 00:02:31,710 -> 00:02:31,930  " the"
  [187] 00:02:31,930 -> 00:02:32,320  " moon"
  [188] 00:02:32,320 -> 00:02:33,320  " 5"
  [189] 00:02:34,160 -> 00:02:34,320  ","
  [190] 00:02:34,550 -> 00:02:35,420  " 4"
  [191] 00:02:35,420 -> 00:02:36,140  ","
  [192] 00:02:36,140 -> 00:02:37,250  " 3"
  [193] 00:02:37,260 -> 00:02:37,980  ","
  [194] 00:02:37,980 -> 00:02:39,080  " 2"
  [195] 00:02:39,080 -> 00:02:39,810  ","
  [196] 00:02:39,820 -> 00:02:40,920  " 1"
  [197] 00:02:40,920 -> 00:02:41,290  ","
  [198] 00:02:41,290 -> 00:02:41,850  " Let"
  [199] 00:02:41,850 -> 00:02:42,220  "'s"
  [200] 00:02:42,220 -> 00:02:42,590  " Go"
  [201] 00:02:42,590 -> 00:02:43,160  "!"
[00:07:49] [info] [We're going to the moon童谣歌曲] grouped cues (27):
  [  0] 00:00:01,850 -> 00:00:07,170  "zoom zoom zoom,"
  [  1] 00:00:07,170 -> 00:00:15,030  "we're going to the moon zoom zoom zoom, we're going to"
  [  2] 00:00:15,080 -> 00:00:18,300  "the moon zoom zoom zoom,"
  [  3] 00:00:18,520 -> 00:00:26,500  "we're leaving very soon if you want to take a trip, climb aboard my rocket ship zoom zoom zoom, we're"
  [  4] 00:00:26,500 -> 00:00:31,230  "going to the moon zoom"
  [  5] 00:00:31,230 -> 00:00:40,200  "zoom zoom,"
  [  6] 00:00:40,200 -> 00:00:44,810  "we're"
  [  7] 00:00:44,810 -> 00:00:50,960  "going to"
  [  8] 00:00:50,960 -> 00:00:58,990  "the moon zoom zoom zoom,"
  [  9] 00:00:59,130 -> 00:01:06,900  "we're leaving very soon if you want to take a trip, climb aboard my rocket ship zoom zoom zoom,"
  [ 10] 00:01:06,900 -> 00:01:14,380  "we're going to the moon zoom zoom"
  [ 11] 00:01:14,380 -> 00:01:18,680  "zoom,"
  [ 12] 00:01:18,680 -> 00:01:25,810  "we're going"
  [ 13] 00:01:25,850 -> 00:01:32,320  "to the moon"
  [ 14] 00:01:32,320 -> 00:01:35,570  "zoom zoom zoom,"
  [ 15] 00:01:35,570 -> 00:01:43,440  "we're going to the moon zoom zoom zoom, we're leaving"
  [ 16] 00:01:43,440 -> 00:01:46,200  "very soon if you want to take a trip,"
  [ 17] 00:01:46,200 -> 00:01:49,980  "climb aboard my rocket ship zoom zoom zoom,"
  [ 18] 00:01:49,980 -> 00:01:51,720  "we're going to the moon"
  [ 19] 00:01:53,890 -> 00:01:58,890  "zoom zoom"
  [ 20] 00:01:58,920 -> 00:02:04,280  "zoom,"
  [ 21] 00:02:04,280 -> 00:02:08,890  "we're"
  [ 22] 00:02:08,890 -> 00:02:15,060  "going to"
  [ 23] 00:02:15,060 -> 00:02:22,940  "the moon zoom zoom zoom,"
  [ 24] 00:02:23,160 -> 00:02:30,580  "we're leaving very soon if you want to take a trip, climb aboard my rocket ship zoom zoom zoom,"
  [ 25] 00:02:30,580 -> 00:02:37,980  "we're going to the moon 5, 4, 3,"
  [ 26] 00:02:37,980 -> 00:02:43,160  "2, 1, Let's Go!"
[00:07:49] [info] [We're going to the moon童谣歌曲] refined cues (26):
  [  0] 00:00:02,022 -> 00:00:07,170  "zoom zoom zoom,"
  [  1] 00:00:07,170 -> 00:00:15,030  "we're going to the moon zoom zoom zoom, we're going to"
  [  2] 00:00:15,080 -> 00:00:18,300  "the moon zoom zoom zoom,"
  [  3] 00:00:18,520 -> 00:00:26,500  "we're leaving very soon if you want to take a trip, climb aboard my rocket ship zoom zoom zoom, we're"
  [  4] 00:00:26,500 -> 00:00:31,230  "going to the moon zoom"
  [  5] 00:00:33,734 -> 00:00:40,200  "zoom zoom,"
  [  6] 00:00:40,200 -> 00:00:44,810  "we're"
  [  7] 00:00:44,810 -> 00:00:50,960  "going to"
  [  8] 00:00:50,960 -> 00:00:58,990  "the moon zoom zoom zoom,"
  [  9] 00:00:59,130 -> 00:01:06,900  "we're leaving very soon if you want to take a trip, climb aboard my rocket ship zoom zoom zoom,"
  [ 10] 00:01:06,900 -> 00:01:14,380  "we're going to the moon zoom zoom"
  [ 11] 00:01:14,380 -> 00:01:18,680  "zoom,"
  [ 12] 00:01:18,680 -> 00:01:25,810  "we're going"
  [ 13] 00:01:28,614 -> 00:01:32,320  "to the moon"
  [ 14] 00:01:33,510 -> 00:01:35,570  "zoom zoom zoom,"
  [ 15] 00:01:35,570 -> 00:01:43,440  "we're going to the moon zoom zoom zoom, we're leaving"
  [ 16] 00:01:43,440 -> 00:01:46,200  "very soon if you want to take a trip,"
  [ 17] 00:01:46,200 -> 00:01:49,980  "climb aboard my rocket ship zoom zoom zoom,"
  [ 18] 00:01:49,980 -> 00:01:51,720  "we're going to the moon"
  [ 19] 00:01:53,890 -> 00:01:56,924  "zoom zoom"
  [ 20] 00:01:58,920 -> 00:02:04,280  "zoom,"
  [ 21] 00:02:04,280 -> 00:02:08,890  "we're"
  [ 22] 00:02:15,060 -> 00:02:22,940  "the moon zoom zoom zoom,"
  [ 23] 00:02:23,160 -> 00:02:30,580  "we're leaving very soon if you want to take a trip, climb aboard my rocket ship zoom zoom zoom,"
  [ 24] 00:02:30,580 -> 00:02:37,980  "we're going to the moon 5, 4, 3,"
  [ 25] 00:02:37,980 -> 00:02:43,160  "2, 1, Let's Go!"
[00:07:49] [info] [We're going to the moon童谣歌曲] final subtitles (26):
  [  0] 00:00:02,022 -> 00:00:07,170  "zoom zoom zoom,"
  [  1] 00:00:07,170 -> 00:00:15,030  "we're going to the moon zoom zoom zoom, we're going to"
  [  2] 00:00:15,080 -> 00:00:18,300  "the moon zoom zoom zoom,"
  [  3] 00:00:18,520 -> 00:00:26,500  "we're leaving very soon if you want to take a trip, climb aboard my rocket ship zoom zoom zoom, we're"
  [  4] 00:00:26,500 -> 00:00:31,230  "going to the moon zoom"
  [  5] 00:00:33,734 -> 00:00:40,200  "zoom zoom,"
  [  6] 00:00:40,200 -> 00:00:44,810  "we're"
  [  7] 00:00:44,810 -> 00:00:50,960  "going to"
  [  8] 00:00:50,960 -> 00:00:58,990  "the moon zoom zoom zoom,"
  [  9] 00:00:59,130 -> 00:01:06,900  "we're leaving very soon if you want to take a trip, climb aboard my rocket ship zoom zoom zoom,"
  [ 10] 00:01:06,900 -> 00:01:14,380  "we're going to the moon zoom zoom"
  [ 11] 00:01:14,380 -> 00:01:18,680  "zoom,"
  [ 12] 00:01:18,680 -> 00:01:22,370  "we're going"
  [ 13] 00:01:28,614 -> 00:01:32,320  "to the moon"
  [ 14] 00:01:33,510 -> 00:01:35,570  "zoom zoom zoom,"
  [ 15] 00:01:35,570 -> 00:01:43,440  "we're going to the moon zoom zoom zoom, we're leaving"
  [ 16] 00:01:43,440 -> 00:01:46,200  "very soon if you want to take a trip,"
  [ 17] 00:01:46,200 -> 00:01:49,980  "climb aboard my rocket ship zoom zoom zoom,"
  [ 18] 00:01:49,980 -> 00:01:51,720  "we're going to the moon"
  [ 19] 00:01:53,890 -> 00:01:56,924  "zoom zoom"
  [ 20] 00:01:58,920 -> 00:02:04,280  "zoom,"
  [ 21] 00:02:04,280 -> 00:02:08,890  "we're"
  [ 22] 00:02:15,060 -> 00:02:22,940  "the moon zoom zoom zoom,"
  [ 23] 00:02:23,160 -> 00:02:30,580  "we're leaving very soon if you want to take a trip, climb aboard my rocket ship zoom zoom zoom,"
  [ 24] 00:02:30,580 -> 00:02:37,980  "we're going to the moon 5, 4, 3,"
  [ 25] 00:02:37,980 -> 00:02:43,160  "2, 1, Let's Go!"
[00:07:49] [info] generate subtitle done!
[00:07:49] [info] refine provider resolved: Gemini (显式指定)
[00:07:49] [info] Correction batch 1/2 attempt 1/3 (anchored)
[00:07:56] [info] Correction batch 2/2 attempt 1/3 (anchored)
[00:08:03] [info] AI correction done: 5/26 entries changed, errors 0
[00:08:03] [info] refine stage done: 26 -> 26 cues (We're going to the moon童谣歌曲)
[00:08:03] [info] proofread data written: /Users/fjm/Documents/丰雨桐/26年暑假/062626 二年级英语暑假作业/1-8 周英语儿歌/.smartsub-proofread/We're_going_to_the_moon童谣歌曲.htybs3781ek.json
[00:08:03] [info] source subtitle converted to lrc
[00:08:03] [info] process file done We're going to the moon童谣歌曲