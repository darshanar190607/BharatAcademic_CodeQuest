import numpy as np
import collections

y = np.load('ml-service/data/final/y_train.npy')
print(f"Total samples: {len(y)}")
print(f"Distribution: {collections.Counter(y)}")
