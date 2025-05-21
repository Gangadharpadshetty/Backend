class Solution {
public:
    int sumOfEncryptedInt(vector<int>& nums) {
        int max = 0;
        for(int i=0;i<nums.size();i++ ){
            if(nums[i]>max){
                max=nums[i];
            }
        }
        return max*nums.size();
    }
};